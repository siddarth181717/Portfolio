import math
from PIL import Image, ImageFilter

def process_avatar():
    img_path = "assets/pixar_dev_head_exact.jpg"
    out_path = "assets/pixar_dev_head_exact.png"
    
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size
    
    pixels = img.load()
    
    # Center coordinates
    cx, cy = width / 2.0, height * 0.45
    max_radius = min(width, height) * 0.48
    inner_radius = min(width, height) * 0.36
    
    # Process alpha
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            brightness = (r * 0.299 + g * 0.587 + b * 0.114)
            
            # Distance from center
            dist = math.hypot(x - cx, y - cy)
            
            # Dark background removal
            if brightness < 28:
                alpha = 0
            elif brightness < 60:
                alpha = int(255 * (brightness - 28) / (60 - 28))
            else:
                alpha = 255
                
            # Radial edge feathering to eliminate any edge boundary
            if dist > inner_radius:
                radial_alpha = max(0.0, min(1.0, 1.0 - (dist - inner_radius) / (max_radius - inner_radius)))
                # Smoothstep
                radial_alpha = radial_alpha * radial_alpha * (3 - 2 * radial_alpha)
                alpha = int(alpha * radial_alpha)
                
            pixels[x, y] = (r, g, b, alpha)
            
    img.save(out_path, "PNG")
    print("Saved transparent avatar PNG to", out_path)

if __name__ == "__main__":
    process_avatar()
