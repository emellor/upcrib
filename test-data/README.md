# Test Data Directory

This directory is for test images used in the API workflow tests.

## Usage

Place a test house image here named `house.jpg` to use with the complete workflow test:

```bash
./test_complete_workflow.sh
```

## Supported Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

## Recommended Image Properties

- **Size**: 1024x1024 pixels or larger
- **Format**: JPEG for best compatibility
- **Content**: Clear photo of a house exterior
- **Quality**: High resolution for best AI processing results

## Example Usage

```bash
# Copy your test image
cp ~/Pictures/my-house.jpg test-data/house.jpg

# Run the complete workflow test
./test_complete_workflow.sh
```

The test will create a renovation request, poll for completion, and download both the original and generated images for comparison.