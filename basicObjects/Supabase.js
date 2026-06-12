import { createClient } from '@supabase/supabase-js'; 
import { loadEnvFile } from 'process';
loadEnvFile('./config/.env');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

class SupabaseManager{
    async #detectContentType(base64String){
        const contentTypes = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'webm': 'image/webm'
        };
        const header = base64String.substring(0, 12);

        if (header.startsWith('/9j/')) {
            return contentTypes['jpeg']; // o contentTypes['jpeg']
        } 
        if (header.startsWith('iVBORw0KGgo')) {
            return contentTypes['png'];
        } 
        if (header.startsWith('R0lGOD')) {
            return contentTypes['gif'];
        } 
        if (header.startsWith('UklGR')) {
            if (base64String.substring(8, 14).includes('WEBP') || header.startsWith('UklGRg')) {
                return contentTypes['webp'];
            }
        } 
        if (header.startsWith('GkXfo') || header.startsWith('1A45DF')) {
            return contentTypes['webm'];
        }
            return 'plain/text';
    }

    async uploadImage(userName ,bufferImage, imageName){
        const contentType = await this.#detectContentType(bufferImage);
        bufferImage = Buffer.from(bufferImage, 'base64');
        const { data, error } = await supabase.storage
            .from('infused')
            .upload(`users/${userName}/${imageName}.${contentType.split('/')[1]}`, bufferImage, {
                cacheControl: '3600',
                contentType: contentType,
                upsert: true
        });
        if (error) {
            console.log(error);
            logger.error(`Error uploading image: ${error.message}`);
        }
        const { data: publicUrlData } = supabase.storage
            .from('infused')
            .getPublicUrl(`users/${userName}/${imageName}.${contentType.split('/')[1]}`);

        return publicUrlData.publicUrl;
    }

    async deleteImage(url){
        try{
            const path = url
            .replace(/.*\/public\/infused\//, '')
            .replace(/.*\/infused\//, '');
            console.log(path);
            const { data, error } = await supabase.storage
                .from('infused')
                .remove([path]);
            if (error) {
                throw error;
            }
        }
        catch (error) {
            console.log(error.msg);
            logger.error(`Error deleting image: ${error.message}`);
        }
    }
}

const supabaseManager = new SupabaseManager();
export default supabaseManager;