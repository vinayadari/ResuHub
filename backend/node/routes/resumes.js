const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const supabase = require('../supabaseClient');

const router = express.Router();

// Multer: store files in memory (then stream to Supabase Storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (['.pdf', '.doc', '.docx'].includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and DOCX files are allowed'));
        }
    },
});

// ─────────────────────────────────────────
// POST /api/resumes/upload
// Upload a resume file + optional metadata
// ─────────────────────────────────────────
router.post('/upload', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = req.file;
        const ext = path.extname(file.originalname).toLowerCase();
        const fileId = uuidv4();
        const storagePath = `resumes/${fileId}${ext}`;

        // 1. Try uploading file to Supabase Storage (non-blocking)
        let publicUrl = null;
        let storageSucceeded = false;
        try {
            const { data: storageData, error: storageError } = await supabase.storage
                .from('resumes')
                .upload(storagePath, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false,
                });

            if (storageError) {
                console.warn('⚠️  Storage upload warning (bucket may not exist):', storageError.message);
            } else {
                storageSucceeded = true;
                const { data: urlData } = supabase.storage
                    .from('resumes')
                    .getPublicUrl(storagePath);
                publicUrl = urlData?.publicUrl || null;
            }
        } catch (storageErr) {
            console.warn('⚠️  Storage upload skipped:', storageErr.message);
        }

        // 3. Save metadata to database
        const metadata = {
            id: fileId,
            file_name: file.originalname,
            file_size: file.size,
            file_type: ext.replace('.', ''),
            storage_path: storageSucceeded ? storagePath : null,
            public_url: publicUrl,
            name: req.body.name || file.originalname.replace(/\.[^.]+$/, ''),
            industry: req.body.industry || 'General',
            score: req.body.score ? parseInt(req.body.score) : null,
            parsed_data: req.body.parsed_data ? JSON.parse(req.body.parsed_data) : null,
            created_at: new Date().toISOString(),
        };

        const { data: dbData, error: dbError } = await supabase
            .from('resumes')
            .insert([metadata])
            .select()
            .single();

        if (dbError) {
            console.error('DB insert error:', dbError);
            // Still return success since file was uploaded
            return res.status(201).json({
                message: 'File uploaded but metadata not saved',
                file_id: fileId,
                public_url: publicUrl,
                storage_path: storagePath,
                db_error: dbError.message,
            });
        }

        res.status(201).json({
            message: 'Resume uploaded successfully',
            resume: dbData,
        });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────
// GET /api/resumes
// List all resumes (newest first)
// ─────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('resumes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Fetch error:', error);
            return res.status(500).json({ error: error.message });
        }

        res.json({ resumes: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────
// GET /api/resumes/:id
// Get a single resume by ID
// ─────────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('resumes')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        res.json({ resume: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────
// DELETE /api/resumes/:id
// Delete resume (file + metadata)
// ─────────────────────────────────────────
router.delete('/:id', async (req, res) => {
    try {
        // 1. Get the resume record
        const { data: resume, error: fetchError } = await supabase
            .from('resumes')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (fetchError || !resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        // 2. Delete file from storage
        if (resume.storage_path) {
            await supabase.storage
                .from('resumes')
                .remove([resume.storage_path]);
        }

        // 3. Delete metadata from DB
        const { error: deleteError } = await supabase
            .from('resumes')
            .delete()
            .eq('id', req.params.id);

        if (deleteError) {
            return res.status(500).json({ error: deleteError.message });
        }

        res.json({ message: 'Resume deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────
// PATCH /api/resumes/:id
// Update resume metadata (score, name, etc.)
// ─────────────────────────────────────────
router.patch('/:id', async (req, res) => {
    try {
        const updates = {};
        if (req.body.name) updates.name = req.body.name;
        if (req.body.industry) updates.industry = req.body.industry;
        if (req.body.score !== undefined) updates.score = parseInt(req.body.score);
        if (req.body.parsed_data) updates.parsed_data = req.body.parsed_data;

        const { data, error } = await supabase
            .from('resumes')
            .update(updates)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json({ resume: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
