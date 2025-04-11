#!/bin/bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm install react-scripts@5.0.1 --save
echo "Setup complete! Run npm start to launch the application."
