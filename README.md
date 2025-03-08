# AI Image Generator

A pure frontend web application for generating AI images using natural language descriptions.

## Features

- **Minimalist Entry Page**: Full-screen gradient background with a central input box for natural language descriptions
- **Three-Column Generation Page**:
  - Left column: Real-time preview with WebGL rendering
  - Middle column: Prompt input panel with optimization suggestions
  - Right column: History gallery of previously generated images
- **Advanced Settings**: Control over image generation parameters like guidance scale and inference steps
- **Responsive Design**: Works on desktop and mobile devices
- **Local Storage**: Saves generation history for easy access
- **Secure API Integration**: API key is encrypted in the frontend

## Technologies Used

- HTML5
- CSS3 with animations and modern styling
- JavaScript (ES6+)
- Tailwind CSS for styling
- Font Awesome for icons
- WebGL for real-time rendering

## Getting Started

1. Clone this repository
2. Open `index.html` in your browser
3. Enter a description of the image you want to generate
4. Explore the generation page to refine your prompts and view your creations

## Project Structure

```
├── index.html          # Entry page
├── generate.html       # Generation page
├── css/
│   └── styles.css      # Custom styles and animations
├── js/
│   └── main.js         # Application logic and API integration
└── README.md           # Project documentation
```

## API Integration

The application integrates with the Silicon Flow API for image generation. The API key is encrypted in the frontend for basic security.

## Future Improvements

- Add user accounts for better history management
- Implement more advanced WebGL effects for real-time preview
- Add more AI models and generation options
- Improve mobile responsiveness
- Add social sharing capabilities

## License

MIT

## Credits

- Images from Unsplash
- Icons from Font Awesome
- Styling framework from Tailwind CSS 