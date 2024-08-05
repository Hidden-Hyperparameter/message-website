from PIL import Image, ImageDraw

def convert_to_circle(image_path):
    # Open the image
    image = Image.open(image_path).convert("RGBA")

    # Create a circular mask
    mask = Image.new("L", image.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, image.width, image.height), fill=255)

    # Apply the mask to the image
    result = Image.new("RGBA", image.size)
    result.paste(image, mask=mask)

    # Save the result
    result.save("output.png")

# Usage example
convert_to_circle("./logo-small.png")