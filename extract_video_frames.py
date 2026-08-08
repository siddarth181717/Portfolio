import cv2
import os

video_path = r"C:\Users\sonis\Downloads\c17e9cbf71810b4ac4ba1673efb70d19_720w.mp4"
output_dir = r"c:\Users\sonis\.gemini\antigravity\scratch\portfolio-3d\video_frames"

os.makedirs(output_dir, exist_ok=True)

cap = cv2.VideoCapture(video_path)
if not cap.isOpened():
    print("Error opening video file")
    exit(1)

fps = cap.get(cv2.CAP_PROP_FPS)
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
duration = total_frames / fps if fps > 0 else 0

print(f"FPS: {fps}, Total Frames: {total_frames}, Duration: {duration:.2f}s")

# Extract 1 frame every 0.5 or 1.0 second
interval_sec = 1.0
frame_interval = int(fps * interval_sec)

frame_idx = 0
saved_count = 0

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    
    if frame_idx % frame_interval == 0 or frame_idx == total_frames - 1:
        sec = frame_idx / fps
        filename = os.path.join(output_dir, f"frame_{sec:.1f}s.png")
        cv2.imwrite(filename, frame)
        saved_count += 1
        print(f"Saved {filename}")
    
    frame_idx += 1

cap.release()
print(f"Successfully saved {saved_count} frames to {output_dir}")
