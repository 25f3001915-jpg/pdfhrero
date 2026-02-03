import { supabase } from './supabaseClient';

export const logProcessing = async (tool, success, fileSize = 0) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        await supabase.from('processing_logs').insert({
            user_id: user?.id || null, // Allow anonymous logging if allowed by RLS, or null
            tool: tool,
            success: success,
            file_size: fileSize,
        });
    } catch (error) {
        console.error('Failed to log processing:', error);
        // Do not block app execution
    }
};
