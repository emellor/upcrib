#!/usr/bin/env node

// Sample script to add images to iOS Simulator
// This script creates placeholder sample images for testing

const fs = require('fs');
const path = require('path');

console.log('Adding sample images for testing...');

// Create a simple instruction file
const instructions = `
# Adding Sample Images to iOS Simulator

## Quick Method (Drag & Drop):
1. Open iOS Simulator
2. Open Photos app in simulator
3. Drag and drop images from your Mac's Finder into the Photos app

## Sample Images Locations:
You can find sample house/room images at these free sources:

### Unsplash (Free high-quality images):
- https://unsplash.com/s/photos/living-room
- https://unsplash.com/s/photos/kitchen-interior
- https://unsplash.com/s/photos/bedroom-interior
- https://unsplash.com/s/photos/bathroom-interior

### Pexels (Free stock photos):
- https://www.pexels.com/search/living%20room/
- https://www.pexels.com/search/kitchen/
- https://www.pexels.com/search/bedroom/

## Quick Download & Add:
1. Right-click and save 3-5 room images from above links
2. Open iOS Simulator
3. Open Photos app
4. Drag the downloaded images into the Photos app
5. Test your app's "Choose from Gallery" feature

## Alternative: Use Simulator Menu
1. In simulator: Device → Add Photos...
2. Select images from your Mac
3. They'll be added to the photo library

The images will persist across simulator sessions!
`;

fs.writeFileSync(path.join(__dirname, 'SAMPLE_IMAGES_GUIDE.md'), instructions);

console.log('✅ Created SAMPLE_IMAGES_GUIDE.md with instructions');
console.log('📸 Follow the guide to add sample images to your simulator');
