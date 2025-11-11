#!/bin/bash

echo "🚀 Starting Weekly Calendar App..."
echo ""
echo "Backend will run on: http://localhost:3001"
echo "Frontend will run on: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start backend in background
npm run server &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 2

# Start frontend
npm run dev

# When frontend stops (Ctrl+C), kill backend too
kill $BACKEND_PID

