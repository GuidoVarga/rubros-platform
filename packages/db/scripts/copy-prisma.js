import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function copyPrismaFiles() {
  try {
    const baseDir = path.resolve(__dirname, '..');
    
    // Rutas de origen y destino
    const sourceDir = path.join(baseDir, 'generated', 'prisma');
    const distDir = path.join(baseDir, 'dist', 'generated', 'prisma');
    const appDir = path.join(baseDir, '..', '..', 'apps', 'mechanic-finder', 'generated', 'prisma');
    
    console.log('📁 Copiando archivos de Prisma...');
    
    // Crear directorios si no existen
    await fs.ensureDir(distDir);
    await fs.ensureDir(appDir);
    
    // Copiar archivos a dist/generated/prisma
    await fs.copy(sourceDir, distDir);
    console.log('✅ Copiado a dist/generated/prisma');
    
    // Copiar archivos a apps/mechanic-finder/generated/prisma
    await fs.copy(distDir, appDir);
    console.log('✅ Copiado a apps/mechanic-finder/generated/prisma');
    
    console.log('🎉 Todos los archivos copiados exitosamente');
  } catch (error) {
    console.error('❌ Error copiando archivos:', error.message);
    process.exit(1);
  }
}

copyPrismaFiles(); 