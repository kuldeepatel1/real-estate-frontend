import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import { Slider, Avatar, Button, Modal, message } from "antd";
import { UserOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { updateUserProfile, updateProfilePicture } from "../redux/slices/authSlice";

// Helper function to create image from blob
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

// Helper function to get cropped blob
const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      resolve(blob);
    }, "image/jpeg", 0.95);
  });
};

// Build profile picture URL
const buildProfilePictureUrl = (filename) => {
  if (!filename) return null;
  if (filename.startsWith("http://") || filename.startsWith("https://")) {
    return filename;
  }
  if (filename.startsWith("/")) {
    return `${import.meta.env.VITE_API_URL || ""}${filename}`;
  }
  return `${import.meta.env.VITE_API_URL || ""}/static/profile_pictures/${filename}`;
};

export default function EditProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, loading } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Profile image state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  
  // Cropping state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [tempPreview, setTempPreview] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  // Prefill form with user data
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || user.user_name || "",
        email: user.email || user.user_email || "",
        phone: user.phone || user.user_mobile || "",
        address: user.address || user.user_address || "",
      });

      // Set initial profile picture
      const profilePic = user.profilePicture || user.user_profile_picture;
      if (profilePic) {
        const url = buildProfilePictureUrl(profilePic);
        setImagePreview(url);
        setImageUrl(url);
      }
    }
  }, [user]);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        message.error("Please select an image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setTempPreview(reader.result);
        setPreviewOpen(true);
        setZoom(1);
        setCrop({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input
  const handleUploadClick = () => {
    // Reset file input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    fileInputRef.current?.click();
  };

  // Handle avatar click
  const handleAvatarClick = () => {
    handleUploadClick();
  };

// Remove image
  const handleRemoveImage = async (e) => {
    e.stopPropagation();
    
    try {
      // Send request to remove profile picture
      const formData = new FormData();
      formData.append("user_name", form.name);
      formData.append("user_phone", form.phone);
      formData.append("user_address", form.address);
      formData.append("remove_profile_picture", "true");
      
      const res = await dispatch(updateUserProfile(formData));
      
      if (res.meta.requestStatus === "fulfilled") {
        message.success("Profile picture removed successfully!");
        setImageFile(null);
        setImagePreview(null);
        setImageUrl(null);
        dispatch(updateProfilePicture(null));
      } else {
        message.error(res.payload || "Failed to remove profile picture");
      }
    } catch (error) {
      console.error("Failed to remove profile picture:", error);
      message.error("Failed to remove profile picture");
    }
  };

  // Handle crop complete
  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // Handle modal ok
  const handleModalOk = async () => {
    if (!croppedAreaPixels) return;

    setUploading(true);
    try {
      const croppedBlob = await getCroppedImg(tempPreview, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], "profile.jpg", {
        type: "image/jpeg",
      });

      setImageFile(croppedFile);

      // Create local preview URL for immediate feedback
      const localPreviewUrl = URL.createObjectURL(croppedBlob);
      setImagePreview(localPreviewUrl);
      setImageUrl(localPreviewUrl);

      // Create FormData for upload
      const formData = new FormData();
      formData.append("user_profile_picture", croppedFile);
      formData.append("user_name", form.name);
      formData.append("user_phone", form.phone);
      formData.append("user_address", form.address);

      // Upload to server
      const res = await dispatch(updateUserProfile(formData));
      
      if (res.meta.requestStatus === "fulfilled") {
        message.success("Profile picture uploaded successfully!");
        
        // Get the updated user data from the response
        const updatedUser = res.payload;
        if (updatedUser) {
          // Use the server-provided URL
          const serverUrl = updatedUser.profilePicture || updatedUser.user_profile_picture;
          if (serverUrl) {
            setImageUrl(serverUrl);
            setImagePreview(serverUrl);
          }
        }
        
        // Also update Redux state directly
        dispatch(updateProfilePicture(updatedUser?.profilePicture || updatedUser?.user_profile_picture));
        
        setPreviewOpen(false);
      } else {
        message.error(res.payload || "Failed to upload image");
      }
    } catch (error) {
      console.error("Failed to process image:", error);
      message.error("Failed to process image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      user_name: form.name,
      user_phone: form.phone,
      user_address: form.address,
    };

    const res = await dispatch(updateUserProfile(payload));
    if (res.meta.requestStatus === "fulfilled") {
      message.success("Profile updated successfully!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } else {
      message.error(res.payload || "Failed to update profile");
    }
  };

  return (
    <div className="min-h-[80vh] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Edit Profile</h1>
          <p className="text-gray-600 mt-2">Update your personal information below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Profile Image
            </h3>

            <div className="flex items-center gap-6">
              {/* Circle Preview */}
              <div className="relative inline-block cursor-pointer" onClick={handleAvatarClick}>
                <Avatar
                  size={120}
                  src={imagePreview}
                  icon={!imagePreview && <UserOutlined />}
                  className="border border-gray-300 shadow-sm"
                />

                {/* Delete Icon */}
                {imagePreview && (
                  <div
                    onClick={handleRemoveImage}
                    className="
                      absolute -top-2 -right-2
                      bg-red-500 text-white
                      rounded-full p-1
                      cursor-pointer
                      shadow-md
                      hover:bg-red-600
                    "
                  >
                    <DeleteOutlined style={{ fontSize: 14 }} />
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <Button 
                icon={<PlusOutlined />} 
                onClick={handleUploadClick}
                size="large"
              >
                Upload Profile Image
              </Button>
            </div>
          </div>

          {/* Current Profile Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Current Profile Information
            </h2>
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-indigo-600">
                      {user?.name?.charAt(0) || user?.user_name?.charAt(0) || "U"}
                    </span>
                  )}
                </div>
                <div className="flex-1 w-full">
                  <p className="font-semibold text-gray-900 text-lg">
                    {user?.name || user?.user_name || "User"}
                  </p>
                  <p className="text-gray-500 mt-1">{user?.email || user?.user_email}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                      {user?.role || "user"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-100 cursor-not-allowed focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                  value={form.email}
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter your phone number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter your address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Account Information
            </h2>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Account ID</p>
                  <p className="text-sm text-gray-500 font-mono">{user?.id || user?.user_id || "N/A"}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Your account information is secure. Only update fields that need to be changed.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Crop Modal */}
      <Modal
        open={previewOpen}
        title="Set Profile Image"
        onCancel={() => setPreviewOpen(false)}
        onOk={handleModalOk}
        okText={uploading ? 'Uploading...' : 'Set Profile Image'}
        width={420}
        confirmLoading={uploading}
      >
        <div className="relative w-full h-[320px] bg-black rounded-lg overflow-hidden">
          {tempPreview && (
            <Cropper
              image={tempPreview}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}

