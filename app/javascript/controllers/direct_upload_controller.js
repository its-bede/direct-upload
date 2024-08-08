import { Controller } from "@hotwired/stimulus"
import SparkMD5 from "spark-md5";

// Connects to data-controller="direct-upload"
export default class extends Controller {
  static targets = ["input", "progress"]

  connect() {
    this.inputTarget.addEventListener("change", this.upload.bind(this));
  }

  async upload() {
    const file = this.inputTarget.files[0];
    if (!file) return;

    const checksum = await this.createChecksum(file);
    const formData = new FormData();
    formData.append("blob[filename]", file.name);
    formData.append("blob[content_type]", file.type);
    formData.append("blob[byte_size]", file.size);
    formData.append("blob[checksum]", checksum);

    const response = await fetch("/direct_uploads", {
      method: "POST",
      headers: {
        "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute("content")
      },
      body: formData
    });

    if (response.ok) {
      const data = await response.json();
      await this.uploadFileToS3(file, data);
    } else {
      console.error("Direct upload failed");
    }
  }

  createChecksum(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const binary = reader.result;
        const checksum = SparkMD5.ArrayBuffer.hash(binary);
        resolve(checksum);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  async uploadFileToS3(file, data) {
    const uploadResponse = await fetch(data.direct_upload.url, {
      method: "PUT",
      headers: data.direct_upload.headers,
      body: file
    });

    if (uploadResponse.ok) {
      console.log("File uploaded successfully!");
      this.element.dispatchEvent(new CustomEvent("file-uploaded", { detail: { signedId: data.signed_id } }));
      this.progressTarget.style.width = "100%";
    } else {
      console.error("Upload to S3 failed");
    }
  }
}
