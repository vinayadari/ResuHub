import { supabase } from '../libs/supabase';

const API_BASE = import.meta.env.VITE_NODE_API_BASE;
const PYTHON_API_BASE = import.meta.env.VITE_PYTHON_API_BASE;

// Export the shared supabase client
export { supabase };


// Fetch all resumes
export const fetchResumes = async () => {
    try {
        const response = await fetch(`${API_BASE}/resumes`);
        if (!response.ok) {
            throw new Error('Failed to fetch resumes');
        }
        const data = await response.json();
        return data.resumes;
    } catch (error) {
        console.error("API Error:", error);
        return [];
    }
};

// Fetch single resume
export const fetchResume = async (id) => {
    const response = await fetch(`${API_BASE}/resumes/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch resume');
    }
    const data = await response.json();
    return data.resume;
};

// Delete a resume
export const deleteResume = async (id) => {
    const response = await fetch(`${API_BASE}/resumes/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete resume');
    }
    return await response.json();
};

// Analyze resume (Using Python Backend as per migration)
export const analyzeResume = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${PYTHON_API_BASE}/analyze`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Analysis failed');
    }

    return await response.json();
};

// Upload resume (Save to Node Backend/Supabase)
export const uploadResume = async (file, metadata) => {
    const formData = new FormData();
    formData.append('resume', file);

    if (metadata.name) formData.append('name', metadata.name);
    if (metadata.score) formData.append('score', metadata.score);
    if (metadata.parsed_data) formData.append('parsed_data', JSON.stringify(metadata.parsed_data));

    const response = await fetch(`${API_BASE}/resumes/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Upload failed');
    }

    const result = await response.json();
    // Normalize response to return { public_url, ... }
    return {
        ...result,
        public_url: result.public_url || result.resume?.public_url
    };
};
