const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting FurniQ Admin Panel Development Environment...\n');

// Start backend server
console.log('📡 Starting Backend Server...');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'FurniQ-Panel-Backend'),
  stdio: 'inherit',
  shell: true
});

// Wait a bit for backend to start, then start frontend
setTimeout(() => {
  console.log('\n🌐 Starting Frontend Server...');
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'FurniQ-Admin_Panel-front'),
    stdio: 'inherit',
    shell: true
  });

  // Handle frontend process exit
  frontend.on('close', (code) => {
    console.log(`\n❌ Frontend server exited with code ${code}`);
    backend.kill();
    process.exit(code);
  });
}, 3000);

// Handle backend process exit
backend.on('close', (code) => {
  console.log(`\n❌ Backend server exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  backend.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down servers...');
  backend.kill();
  process.exit(0);
});
