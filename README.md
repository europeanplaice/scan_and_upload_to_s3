# scan_and_upload_to_s3
It is a Helper program that finds a scanned document from a folder and immediately uploads it to S3. It monitors a specified folder and runs an event on change. It assumes that a user scans a document at first, and the scanner saves it to the folder. This program finds the saved document immediately and runs the uploading command to s3 at this time.
