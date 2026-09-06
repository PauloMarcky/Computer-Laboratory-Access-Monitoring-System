import cv2
import pytesseract
import requests
import re

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
EXPRESS_API_URL = "http://localhost:5000/api/v1/attendance/scan"

TESSERACT_CONFIG = r'--psm 11 -c tessedit_char_whitelist=0123456789-'

cap = cv2.VideoCapture(0)

frame_count = 0
OCR_INTERVAL = 5

print("[SCANNER] Scanner active. Hold your Student ID up to the camera...")

try:
    while True:
        ret, frame = cap.read()
        if not ret:
            print("[ERROR] Cannot read camera feed.")
            break

        frame_count += 1
        height, width, _ = frame.shape
        roi = frame[int(height*0.2):int(height*0.8),
                    int(width*0.1):int(width*0.9)]

        if frame_count % OCR_INTERVAL == 0 and roi.shape[0] > 0 and roi.shape[1] > 0:
            gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)

            # Upscale ROI 2x — Tesseract requires larger font size for high accuracy
            resized = cv2.resize(gray, None, fx=2, fy=2,
                                 interpolation=cv2.INTER_CUBIC)

            try:
                raw_text = pytesseract.image_to_string(
                    resized, config=TESSERACT_CONFIG).strip()

                # Print real-time output to terminal for debugging
                if len(raw_text) > 0:
                    print(f"[OCR RAW READ]: '{raw_text}'")

                # Updated Regex: Supports 2 to 4 year digits (matches "24-10326", "24 10326", or "2410326")
                id_match = re.search(r'\d{2,4}[-\s]?\d{4,5}', raw_text)

                if id_match:
                    raw_id = id_match.group(0)

                    # Dynamic ID Normalization logic
                    if '-' in raw_id:
                        formatted_id = raw_id.replace(' ', '')
                    else:
                        digits_only = re.sub(r'[^\d]', '', raw_id)
                        # Format 7 digits ("2410326") -> "24-10326"
                        if len(digits_only) == 7:
                            formatted_id = f"{digits_only[:2]}-{digits_only[2:]}"
                        # Format 9 digits ("202410326") -> "2024-10326"
                        else:
                            formatted_id = f"{digits_only[:4]}-{digits_only[4:]}"

                    print(
                        f"[VALID ID DETECTED]: {formatted_id}. Querying Express...")

                    response = requests.post(
                        EXPRESS_API_URL,
                        json={"scannedId": formatted_id},
                        timeout=2
                    )

                    if response.status_code == 200:
                        data = response.json()

                        if data.get("matched") is True:
                            matched_name = data.get("studentName")
                            student_id = data.get("studentId")

                            cap.release()
                            cv2.destroyAllWindows()

                            print("\n" + "=" * 55)
                            print(
                                "          [MATCH FOUND - ACCESS GRANTED]          ")
                            print("=" * 55)
                            print(f"  STUDENT ID   : {student_id}")
                            print(f"  FULL NAME    : {matched_name}")
                            print("=" * 55 + "\n")
                            break

            except Exception as e:
                pass

        # Draw scanning target box
        cv2.rectangle(frame, (int(width*0.1), int(height*0.2)),
                      (int(width*0.9), int(height*0.8)), (0, 255, 0), 2)
        cv2.putText(frame, "Scan Student ID Number", (30, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.imshow("CLAMS ID Scanner", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            print("\n[INFO] Manual exit.")
            break

except KeyboardInterrupt:
    print("\n[INFO] Scanner manually stopped.")

finally:
    if cap.isOpened():
        cap.release()
    cv2.destroyAllWindows()
