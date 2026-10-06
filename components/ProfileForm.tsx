"use client";

import { useState } from "react";
import { createClient } from "../utils/supabase/client";

type Props = {
  userId: string;
  initialFirstName: string;
  initialLastName: string;
  initialAvatarUrl: string;
};

export default function ProfileForm({
                                      userId,
                                      initialFirstName,
                                      initialLastName,
                                      initialAvatarUrl,
                                    }: Props) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [message, setMessage] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);

  const saveProfile = async () => {
    const supabase = createClient();

    const { error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
        })
        .eq("id", userId);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Profile saved successfully ✓");
    }
  };

  const uploadAvatar = async (
      event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

    if (uploadError) {
      setMessage(uploadError.message);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    const { error: profileError } = await supabase
        .from("profiles")
        .update({
          avatar_url: publicUrl,
        })
        .eq("id", userId);

    if (profileError) {
      setMessage(profileError.message);
      return;
    }

    setAvatarUrl(publicUrl);
    setMessage("Profile photo updated ✓");
  };

  return (
      <div className="profile-form">
        <div className="avatar-section">
          <div className="avatar-frame">
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt="Profile"
                    className="avatar-image"
                />
            ) : (
                <div className="avatar-placeholder">
                  {firstName.charAt(0).toUpperCase() || "C"}
                </div>
            )}
          </div>

          <div className="avatar-actions">
            <h2>Profile photo</h2>
            <p>Upload a photo to personalize your account.</p>

            <label htmlFor="avatar-upload" className="upload-button">
              Choose photo
            </label>

            <input
                id="avatar-upload"
                className="file-input"
                type="file"
                accept="image/*"
                onChange={uploadAvatar}
            />
          </div>
        </div>

        <div className="profile-divider" />

        <div className="profile-form-fields">
          <div className="field-group">
            <label htmlFor="first-name">First name</label>
            <input
                id="first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
            />
          </div>

          <div className="field-group">
            <label htmlFor="last-name">Last name</label>
            <input
                id="last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
            />
          </div>

          <button
              type="button"
              className="profile-save-button"
              onClick={saveProfile}
          >
            Save Profile
          </button>

          {message && <p className="profile-message">{message}</p>}
        </div>
      </div>
  );
}