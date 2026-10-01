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
      setMessage("Profile saved!");
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
setMessage("Avatar uploaded!");
  // 下一步：生成文件名
  // 下一步：上传到 avatars
  // 下一步：取得 public URL
  // 下一步：更新 profiles.avatar_url
};


  return (
    <div>
        {avatarUrl && (
  <img
    src={avatarUrl}
    alt="Profile"
    width="120"
    height="120"
  />
)}

<div>
  <label>Profile photo</label>
  <br />
  <input
    type="file"
    accept="image/*"
    onChange={uploadAvatar}
  />
</div>
      <div>
        <label>First name</label>
        <br />
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First name"
        />
      </div>

      <div>
        <label>Last name</label>
        <br />
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last name"
        />
      </div>

      <button onClick={saveProfile}>Save Profile</button>

      <p>{message}</p>
    </div>
  );
}