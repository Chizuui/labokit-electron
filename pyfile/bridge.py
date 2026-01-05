import sys
import argparse
from PIL import Image
import subprocess
import os
import platform
from pathlib import Path

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
        # Get the RealESRGAN executable path
        project_root = Path(__file__).parent.parent
        realesrgan_exe = project_root / "utils" / "upscale" / "realesrgan-ncnn-vulkan.exe"
        models_dir = project_root / "utils" / "upscale" / "models"
        
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
        except ImportError:
            print("ERROR: rembg not installed. Install with: pip install rembg onnxruntime", flush=True)
            sys.exit(1)
        
        # Use local u2net model
        project_root = Path(__file__).parent.parent
        model_path = project_root / "utils" / "rembg" / "u2net.onnx"
        
        if not model_path.exists():
            raise FileNotFoundError(f"u2net.onnx model not found at {model_path}")
        
        print("LOADING_MODEL", flush=True)
        # Create session with local model - use the model file path directly
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

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("command", help="The operation to perform (upscale, rembg)")
    parser.add_argument("--input", help="Input file path", required=True)
    parser.add_argument("--output", help="Output file path", required=True)
    parser.add_argument("--model", default="realesrgan-x4plus", help="Model to use for upscaling")
    
    args = parser.parse_args()

    if args.command == "upscale":
        upscale_image(args.input, args.output, args.model)
    elif args.command == "rembg":
        remove_background(args.input, args.output)
    else:
        print("UNKNOWN_COMMAND", flush=True)