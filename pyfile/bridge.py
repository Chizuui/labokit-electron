import sys
import argparse
from PIL import Image
import subprocess
import os
import platform
from pathlib import Path
from io import BytesIO
import base64

def upscale_image(input_path, output_path, model="realesrgan-x4plus"):
    try:
        print("PROCESSING", flush=True)
        print("UPSCALING_STARTED", flush=True)
        
        # Get the RealESRGAN executable path based on OS
        project_root = Path(__file__).parent.parent
        upscale_dir = project_root / "utils" / "upscale"
        
        # Detect platform and select appropriate executable
        system = platform.system()
        if system == "Windows":
            realesrgan_exe = upscale_dir / "realesrgan-ncnn-vulkan.exe"
        elif system == "Linux":
            realesrgan_exe = upscale_dir / "realesrgan-ncnn-vulkan"
        elif system == "Darwin":  # macOS
            realesrgan_exe = upscale_dir / "realesrgan-ncnn-vulkan"
        else:
            raise OSError(f"Unsupported operating system: {system}")
        
        models_dir = upscale_dir / "models"
        
        if not realesrgan_exe.exists():
            raise FileNotFoundError(f"RealESRGAN executable not found at {realesrgan_exe}")
        
        if not models_dir.exists():
            raise FileNotFoundError(f"Models directory not found at {models_dir}")
        
        # Validate model file exists
        model_param = models_dir / f"{model}.param"
        model_bin = models_dir / f"{model}.bin"
        
        if not model_param.exists() or not model_bin.exists():
            raise FileNotFoundError(f"Model files not found for {model}")
        
        # Extract scale from model name
        scale = 4  # default
        if "x2" in model:
            scale = 2
        elif "x3" in model:
            scale = 3
        elif "x4" in model:
            scale = 4
        
        print(f"MODEL_SELECTED:{model}", flush=True)
        
        # Check if input image has transparency
        input_img = Image.open(input_path)
        has_alpha = input_img.mode in ['RGBA', 'LA', 'PA'] or (input_img.mode == 'P' and 'transparency' in input_img.info)
        
        if has_alpha:
            print("DETECTED_TRANSPARENT_IMAGE", flush=True)
            # Extract alpha channel before upscaling
            if input_img.mode == 'P':
                input_img = input_img.convert('RGBA')
            alpha_channel = input_img.split()[-1]
            
            # Scale alpha channel separately
            alpha_scaled = alpha_channel.resize(
                (alpha_channel.width * scale, alpha_channel.height * scale),
                Image.Resampling.LANCZOS
            )
        
        # Build command with proper path separators
        cmd = [
            str(realesrgan_exe),
            "-i", str(input_path),
            "-o", str(output_path),
            "-n", model,
            "-s", str(scale),
            "-f", "png"
        ]
        
        # Run RealESRGAN from models directory
        print("EXECUTING_UPSCALE", flush=True)
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=str(models_dir))
        
        if result.returncode != 0:
            raise RuntimeError(f"RealESRGAN failed: {result.stderr}")
        
        # Post-process: restore transparency if original had alpha
        if has_alpha:
            print("RESTORING_TRANSPARENCY", flush=True)
            upscaled_img = Image.open(output_path)
            upscaled_img = upscaled_img.convert('RGBA')
            upscaled_img.putalpha(alpha_scaled)
            upscaled_img.save(output_path, 'PNG')
        
        print("UPSCALE_COMPLETE", flush=True)
        print("SAVING", flush=True)
        print("SUCCESS", flush=True)
        
    except Exception as e:
        print(f"ERROR: {str(e)}", flush=True)
        import traceback
        print(f"TRACEBACK: {traceback.format_exc()}", flush=True)
        sys.exit(1)

def remove_background(input_path, output_path):
    try:
        print("PROCESSING", flush=True)
        print("REMOVING_BG", flush=True)
        
        try:
            from rembg import remove, new_session
        except ImportError as e:
            print("ERROR: Missing Python packages required for background removal", flush=True)
            print("INSTALL_INSTRUCTIONS: Please install with:\n  pip install rembg torch torchvision onnxruntime", flush=True)
            print(f"IMPORT_ERROR: {e}", flush=True)
            sys.exit(1)
        
        # Use local u2net model
        project_root = Path(__file__).parent.parent
        model_path = project_root / "utils" / "rembg" / "u2net.onnx"
        
        if not model_path.exists():
            raise FileNotFoundError(f"u2net.onnx model not found at {model_path}")
        
        print("LOADING_MODEL", flush=True)
        # Set environment variable to prevent model download
        os.environ['U2NET_HOME'] = str(model_path.parent)
        # Create session with local model
        session = new_session("u2net", providers=["CPUExecutionProvider"])
        
        with open(input_path, 'rb') as i:
            input_data = i.read()
        
        print("REMOVING_BACKGROUND", flush=True)
        output_data = remove(input_data, session=session)
        
        print("SAVING", flush=True)
        with open(output_path, 'wb') as o:
            o.write(output_data)
        
        print("SUCCESS", flush=True)
    except Exception as e:
        print(f"ERROR: {str(e)}", flush=True)
        import traceback
        print(f"TRACEBACK: {traceback.format_exc()}", flush=True)
        sys.exit(1)

def convert_image(input_path, output_path, output_format="png"):
    try:
        print("PROCESSING", flush=True)
        print("CONVERTING_IMAGE", flush=True)
        
        # Open the image
        img = Image.open(input_path)
        
        print(f"LOADING_IMAGE", flush=True)
        
        # Convert RGBA to RGB if needed for formats that don't support transparency
        if output_format.lower() in ['jpg', 'jpeg', 'bmp'] and img.mode in ['RGBA', 'LA', 'P']:
            print("CONVERTING_COLOR_SPACE", flush=True)
            # Create white background
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode in ['RGBA', 'LA'] else None)
            img = background
        
        print(f"SAVING_AS_{output_format.upper()}", flush=True)
        
        # Determine output format and quality settings
        save_kwargs = {}
        if output_format.lower() in ['jpg', 'jpeg']:
            save_kwargs['quality'] = 95
            save_kwargs['optimize'] = True
        elif output_format.lower() == 'png':
            save_kwargs['optimize'] = True
        elif output_format.lower() == 'webp':
            save_kwargs['quality'] = 95
        elif output_format.lower() == 'gif':
            # GIF conversion
            if img.mode != 'P':
                img = img.convert('P', palette=Image.Palette.ADAPTIVE)
        
        # Save the image
        img.save(output_path, format=output_format.upper(), **save_kwargs)
        
        print("SUCCESS", flush=True)
    except Exception as e:
        print(f"ERROR: {str(e)}", flush=True)
        import traceback
        print(f"TRACEBACK: {traceback.format_exc()}", flush=True)
        sys.exit(1)

def convert_to_svg(input_path, output_path):
    try:
        print("PROCESSING", flush=True)
        print("CONVERTING_TO_SVG", flush=True)
        
        # Open the image
        img = Image.open(input_path)
        
        print("LOADING_IMAGE", flush=True)
        
        # Convert to RGB if needed
        if img.mode in ['RGBA', 'LA']:
            print("CONVERTING_COLOR_SPACE", flush=True)
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[-1])
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        print("CONVERTING_TO_SVG", flush=True)
        
        # Convert image to base64 for embedding in SVG
        img_byte_arr = BytesIO()
        img.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        img_base64 = base64.b64encode(img_byte_arr.getvalue()).decode('utf-8')
        
        width, height = img.size
        
        # Create SVG with embedded image
        svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
  <defs>
    <style>
      image {{ image-rendering: crisp-edges; }}
    </style>
  </defs>
  <image x="0" y="0" width="{width}" height="{height}" xlink:href="data:image/png;base64,{img_base64}"/>
</svg>'''
        
        # Write SVG file
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(svg_content)
        
        print("SUCCESS", flush=True)
    except Exception as e:
        print(f"ERROR: {str(e)}", flush=True)
        import traceback
        print(f"TRACEBACK: {traceback.format_exc()}", flush=True)
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("command", help="The operation to perform (upscale, rembg, convert)")
    parser.add_argument("--input", help="Input file path", required=True)
    parser.add_argument("--output", help="Output file path", required=True)
    parser.add_argument("--model", default="realesrgan-x4plus", help="Model to use for upscaling")
    parser.add_argument("--format", default="png", help="Output format for conversion (jpg, png, webp, bmp, gif, svg)")
    
    args = parser.parse_args()

    if args.command == "upscale":
        upscale_image(args.input, args.output, args.model)
    elif args.command == "rembg":
        remove_background(args.input, args.output)
    elif args.command == "convert":
        if args.format.lower() == "svg":
            convert_to_svg(args.input, args.output)
        else:
            convert_image(args.input, args.output, args.format)
    else:
        print("UNKNOWN_COMMAND", flush=True)