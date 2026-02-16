import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WelcomeHeader from './Welcomeheader.jsx';
import StatCard from './Statcard.jsx';
import ScoreTrendChart from './ScoreTrendChart.jsx';
import SkillsCloud from './SkillsCloud.jsx';
import QuickActions from './Quickactions.jsx';
import RecentResumes from './Recentresumes.jsx';
import { TrendingUp, Star, FileText, Clock } from 'lucide-react';
import { fetchResumes, deleteResume, supabase } from '../utils/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [stats, setStats] = useState({
    avgScore: 0,
    bestResume: null,
    totalResumes: 0,
    lastActive: null
  });

  const fetchData = async () => {
    try {
      const data = await fetchResumes();
      if (data && Array.isArray(data)) {
        // Sort by date descending
        const sorted = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setResumes(sorted);

        // Compute analytics
        const total = sorted.length;
        const avg = total > 0 ? sorted.reduce((sum, r) => sum + (r.score || 0), 0) / total : 0;
        const best = total > 0 ? sorted.reduce((max, r) => (r.score || 0) > (max.score || 0) ? r : max, sorted[0]) : null;
        const last = total > 0 ? sorted[0].created_at : null;

        setStats({
          avgScore: Math.round(avg),
          bestResume: best,
          totalResumes: total,
          lastActive: last
        });
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchData();

    // Real-time subscription
    const channel = supabase
      .channel('dashboard-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'resumes' },
        (payload) => {
          console.log('Real-time update received:', payload);
          fetchData(); // Refresh data on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const statsConfig = [
    {
      id: 'avg-score',
      icon: TrendingUp,
      label: 'Average ATS Score',
      subtitle: 'Across all versions',
      value: stats.avgScore,
      badge: 'AVG',
      trend: stats.totalResumes > 0 ? 'Real-time' : '-',
      gradientFrom: 'indigo',
      gradientTo: 'purple',
      delay: 100
    },
    {
      id: 'best-score',
      icon: Star,
      label: 'Top Resume Score',
      subtitle: stats.bestResume ? stats.bestResume.name : 'No resumes yet',
      value: stats.bestResume ? stats.bestResume.score : 0,
      badge: 'BEST',
      trend: '★',
      gradientFrom: 'purple',
      gradientTo: 'pink',
      delay: 200,
      iconFill: true
    },
    {
      id: 'total-resumes',
      icon: FileText,
      label: 'Total Versions',
      subtitle: 'Documents stored',
      value: stats.totalResumes,
      badge: 'ALL',
      suffix: 'docs',
      gradientFrom: 'blue',
      gradientTo: 'cyan',
      delay: 300
    },
    {
      id: 'last-active',
      icon: Clock,
      label: 'Last Uploaded',
      subtitle: 'Most recent activity',
      value: stats.lastActive ? new Date(stats.lastActive).toLocaleDateString() : '-',
      badge: 'LATEST',
      trend: 'Active',
      gradientFrom: 'emerald',
      gradientTo: 'teal',
      delay: 400
    }
  ];

  // Extract user name from auth context
  const userName = user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'User';

  return (
    <>
      <div className="max-w-[1600px] mx-auto px-8 py-10">
        <WelcomeHeader
          userName={userName}
          isLoaded={isLoaded}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statsConfig.map((stat) => (
            <StatCard
              key={stat.id}
              {...stat}
              isLoaded={isLoaded}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
          <ScoreTrendChart
            data={resumes}
            isLoaded={isLoaded}
            delay={500}
          />
          <SkillsCloud
            resumes={resumes}
            isLoaded={isLoaded}
            delay={600}
          />
          <QuickActions
            isLoaded={isLoaded}
            delay={700}
            onUpload={() => navigate('/ai-review')} // Navigate to upload page
            onReview={() => navigate('/ai-review')}
            onExport={() => alert('Export feature coming soon!')}
          />
        </div>

        {/* Resume History / Version Manager */}
        <RecentResumes
          resumes={resumes}
          isLoaded={isLoaded}
          delay={800}
          onDelete={async (id) => {
            // Deletion handled by Realtime subscription mostly, 
            // but we can call API optimistically too.
            // Actually, since we have Realtime, let's just call API and let subscription update state.
            try {
              await deleteResume(id);
            } catch (err) {
              console.error("Delete failed:", err);
              alert("Failed to delete resume");
            }
          }}
          onResumeClick={(resume) => {
            if (resume.parsed_data) {
              navigate('/ai-review', {
                state: {
                  analysis: resume.parsed_data,
                  fileUrl: resume.public_url || null
                }
              });
            } else {
              alert("Detailed analysis not available for this resume.");
            }
          }}
        />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  );
};

export default Dashboard;
