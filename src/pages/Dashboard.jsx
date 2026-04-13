import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Image as ImageIcon, X, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getProfilePhotoUrl } from "@/lib/profile-photo";
import AppLayout from "@/components/layouts/AppLayout";
import { getProfileCompletionPercent } from "@/lib/app-flow";
import { ProfileModal } from "@/components/ProfileModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [postImagePreview, setPostImagePreview] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const fileInputRef = useRef(null);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [postLikes, setPostLikes] = useState({});
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    checkAuth();
    initializePostsTable();
  }, []);

  const initializePostsTable = async () => {
    try {
      const { error } = await supabase.from("posts").select("id").limit(1);
      if (error) {
        console.error("Posts table not found:", error);
      } else {
        console.log("Posts table exists and is accessible");
      }
    } catch (error) {
      console.error("Error checking posts table:", error);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      loadPosts();

      const channel = supabase
        .channel('posts-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'posts' },
          () => {
            loadPosts();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentUserId]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setCurrentUserId(session.user.id);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (error) {
      toast.error("Error loading profile");
      setLoading(false);
      return;
    }

    setProfile(data);
    setLoading(false);
  };

  const loadPosts = async () => {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (postsError) {
        console.error("Error loading posts:", postsError);
        setPosts([]);
        return;
      }

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        return;
      }

      const userIds = [...new Set(postsData.map(post => post.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds);

      const profileMap = new Map();
      (profilesData || []).forEach(profile => {
        profileMap.set(profile.user_id, profile);
      });

      const transformedPosts = postsData.map(post => {
        try {
          const profileData = profileMap.get(post.user_id);
          const isOwnPost = post.user_id === currentUserId;
          let displayName = "";
          if (isOwnPost && profile?.name?.trim()) {
            displayName = profile.name.trim();
          } else if (profileData && profileData.name && profileData.name.trim()) {
            displayName = profileData.name.trim();
          } else if (profileData && profileData.email) {
            displayName = profileData.email.split('@')[0];
          } else if (isOwnPost && profile?.email) {
            displayName = profile.email.split('@')[0];
          } else {
            displayName = "SkillSync User";
          }
          
          return {
            id: post.id,
            user_id: post.user_id,
            content: post.content || "",
            image_url: post.image_url || null,
            created_at: post.created_at,
            profile: profileData ? {
              user_id: post.user_id,
              name: displayName,
              profile_photo: getProfilePhotoUrl(profileData, currentUserId, post.user_id),
              profile_photo_url: profileData.profile_photo_url,
              profile_photo_visible: profileData.profile_photo_visible,
              hide_photo: profileData.hide_photo,
              email: profileData.email,
              department: profileData.department,
              year: profileData.year,
              bio: profileData.bio,
              domain: profileData.domain,
              skills: profileData.skills,
              interests: profileData.interests,
              github_url: profileData.github_url,
              linkedin_url: profileData.linkedin_url,
              leetcode_url: profileData.leetcode_url,
              is_mentor: profileData.is_mentor,
              mentor_expertise: profileData.mentor_expertise,
              mentor_bio: profileData.mentor_bio,
              mentor_linkedin: profileData.mentor_linkedin,
              years_experience: profileData.years_experience,
            } : {
              user_id: post.user_id,
              name: displayName,
              profile_photo: null,
              email: isOwnPost ? profile?.email : null,
              department: isOwnPost ? profile?.department : null,
              year: isOwnPost ? profile?.year : null,
              bio: isOwnPost ? profile?.bio : null,
              domain: isOwnPost ? profile?.domain : null,
              skills: isOwnPost ? profile?.skills || [] : [],
              interests: isOwnPost ? profile?.interests || [] : [],
              github_url: isOwnPost ? profile?.github_url : null,
              linkedin_url: isOwnPost ? profile?.linkedin_url : null,
              leetcode_url: isOwnPost ? profile?.leetcode_url : null,
              is_mentor: isOwnPost ? profile?.is_mentor : false,
              mentor_expertise: isOwnPost ? profile?.mentor_expertise || [] : [],
              mentor_bio: isOwnPost ? profile?.mentor_bio : null,
              mentor_linkedin: isOwnPost ? profile?.mentor_linkedin : null,
              years_experience: isOwnPost ? profile?.years_experience : null,
            },
          };
        } catch (error) {
          console.error("Error processing post:", error);
          return {
            id: post.id,
            user_id: post.user_id,
            content: post.content || "",
            image_url: post.image_url || null,
            created_at: post.created_at,
            profile: {
              user_id: post.user_id,
              name: post.user_id === currentUserId ? (profile?.name || "You") : "SkillSync User",
              profile_photo: null,
              email: post.user_id === currentUserId ? profile?.email : null,
              department: post.user_id === currentUserId ? profile?.department : null,
              year: post.user_id === currentUserId ? profile?.year : null,
              bio: post.user_id === currentUserId ? profile?.bio : null,
              domain: post.user_id === currentUserId ? profile?.domain : null,
              skills: post.user_id === currentUserId ? profile?.skills || [] : [],
            },
          };
        }
      });

      const likesMap = {};
      transformedPosts.forEach(post => {
        if (!postLikes[post.id]) {
          likesMap[post.id] = 0;
        }
      });
      setPostLikes(prev => ({ ...prev, ...likesMap }));

      setPosts(transformedPosts);
    } catch (error) {
      console.error("Error in loadPosts:", error);
      setPosts([]);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setPostImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPostImage(null);
    setPostImagePreview(null);
  };

  const handlePostSubmit = async () => {
    if (!postContent.trim()) {
      toast.error("Post content cannot be empty");
      return;
    }

    if (!currentUserId) {
      toast.error("You must be logged in to post");
      return;
    }

    setIsPosting(true);

    try {
      let imageUrl = null;

      if (postImage) {
        toast.loading("Uploading image...", { id: "upload-post-image" });
        try {
          const { error: bucketError } = await supabase.storage
            .from('post_images')
            .list('', { limit: 1 });
          
          if (bucketError && (bucketError.message?.includes('not found') || bucketError.message?.includes('Bucket'))) {
            toast.error("Image storage not configured. Post will be created without image.", { id: "upload-post-image" });
          } else {
            const fileExt = postImage.name.split('.').pop();
            const fileName = `${currentUserId}/${Date.now()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
              .from('post_images')
              .upload(fileName, postImage, {
                cacheControl: '3600',
                upsert: false
              });

            if (uploadError) {
              console.error("Upload error:", uploadError);
              toast.error("Failed to upload image. Post will be created without image.", { id: "upload-post-image" });
            } else {
              const { data: { publicUrl } } = supabase.storage
                .from('post_images')
                .getPublicUrl(fileName);

              imageUrl = publicUrl;
              toast.success("Image uploaded!", { id: "upload-post-image" });
            }
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          toast.error("Upload failed. Try again.", { id: "upload-post-image" });
        }
      }

      const { error: postError } = await supabase
        .from("posts")
        .insert({
          user_id: currentUserId,
          content: postContent.trim(),
          image_url: imageUrl,
        });

      if (postError) {
        console.error("Post creation error:", postError);
        toast.error(`Failed to create post: ${postError.message?.substring(0, 50) || 'Unknown error'}`);
        setIsPosting(false);
        return;
      }

      toast.success("Post created successfully!");
      setPostContent("");
      setPostImage(null);
      setPostImagePreview(null);
      setIsPostModalOpen(false);
      loadPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("An error occurred");
    } finally {
      setIsPosting(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour${Math.floor(diffInSeconds / 3600) > 1 ? 's' : ''} ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} day${Math.floor(diffInSeconds / 86400) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const handleLike = (postId) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
        setPostLikes(prevLikes => ({
          ...prevLikes,
          [postId]: Math.max(0, (prevLikes[postId] || 0) - 1)
        }));
      } else {
        newSet.add(postId);
        setPostLikes(prevLikes => ({
          ...prevLikes,
          [postId]: (prevLikes[postId] || 0) + 1
        }));
      }
      return newSet;
    });
  };

  const handleDeletePost = async (postId) => {
    if (!currentUserId) return;
    
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", currentUserId);
      
      if (error) throw error;
      
      toast.success("Post deleted successfully!");
      loadPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error(`Failed to delete post: ${error.message || 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
      </div>
    );
  }

  const profileCompleteness = getProfileCompletionPercent(profile);

  const openProfileCard = (postProfile) => {
    if (!postProfile?.user_id) return;
    setSelectedProfile(postProfile);
    setIsProfileModalOpen(true);
  };

  return (
    <AppLayout>
      <div className="p-6" style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
        <div className="max-w-2xl mx-auto space-y-6">
          <div style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }} className="border rounded-lg p-5">
            <h2 style={{ color: 'var(--text-primary)' }} className="text-xl font-semibold mb-2">What would you like to do first?</h2>
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-4">
              Start by discovering teammates, exploring projects, or checking pending connections.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate("/find-teammates")} style={{ backgroundColor: 'var(--primary)', color: '#fff' }}>
                Find Teammates
              </Button>
              <Button onClick={() => navigate("/projects")} variant="outline" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                Explore Projects
              </Button>
              <Button onClick={() => navigate("/connections")} variant="outline" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                View Connections
              </Button>
            </div>
          </div>

          {profileCompleteness < 80 && (
            <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'var(--warning)', borderWidth: '1px' }} className="rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Complete Your Profile</h3>
                  <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-3">
                    Complete your profile to increase visibility and stand out to mentors and teammates.
                  </p>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div className="h-full rounded-full transition-all" style={{ width: `${profileCompleteness}%`, backgroundColor: 'var(--warning)' }}></div>
                  </div>
                  <p style={{ color: 'var(--text-muted)' }} className="text-xs">{Math.round(profileCompleteness)}% complete</p>
                </div>
                <Button onClick={() => navigate("/profile")} size="sm" style={{ backgroundColor: 'var(--warning)', color: '#000' }} className="ml-4 whitespace-nowrap">
                  Complete Now
                </Button>
              </div>
            </div>
          )}

          <div style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }} className="border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile && getProfilePhotoUrl(profile, currentUserId, currentUserId)} alt={profile?.name} />
                <AvatarFallback>{profile?.name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Dialog open={isPostModalOpen} onOpenChange={setIsPostModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="flex-1 justify-start text-left" style={{ color: 'var(--text-secondary)' }}>
                    Share what's on your mind...
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <DialogHeader>
                    <DialogTitle style={{ color: 'var(--text-primary)' }}>Create a Post</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <Textarea
                      placeholder="What's on your mind?"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="min-h-[150px] resize-none"
                      style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    />
                    {postImagePreview && (
                      <div className="relative">
                        <img src={postImagePreview} alt="Preview" className="w-full rounded-lg max-h-[300px] object-cover" />
                        <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => removeImage()}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <Button variant="outline" type="button" onClick={() => fileInputRef.current?.click()} disabled={isPosting} style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Add Image
                      </Button>
                      <input ref={fileInputRef} id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageSelect} disabled={isPosting} />
                      <Button onClick={handlePostSubmit} disabled={isPosting || !postContent.trim()} style={{ backgroundColor: 'var(--primary)', color: '#fff' }}>
                        {isPosting ? "Posting..." : "Post"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {posts.length === 0 ? (
            <div style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }} className="border rounded-lg p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" style={{ color: 'var(--text-muted)' }} />
              <p style={{ color: 'var(--text-muted)' }}>No posts yet. Be the first to share something!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => {
                const isLiked = likedPosts.has(post.id);
                const likesCount = postLikes[post.id] || 0;
                const isOwnPost = post.user_id === currentUserId;

                return (
                  <div key={post.id} style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }} className="border rounded-lg p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <button
                        type="button"
                        onClick={() => openProfileCard(post.profile)}
                        className="flex flex-1 items-start gap-3 text-left"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={post.profile?.profile_photo} alt={post.profile?.name} />
                          <AvatarFallback>{post.profile?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {isOwnPost ? "You" : post.profile?.name}
                            </div>
                            {isOwnPost && (
                              <Badge style={{ backgroundColor: 'rgba(79, 70, 229, 0.12)', color: 'var(--primary)' }}>
                                Your Post
                              </Badge>
                            )}
                          </div>
                          {!isOwnPost && post.profile?.department && (
                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              {post.profile.department}
                            </div>
                          )}
                          {isOwnPost && (
                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              Posted from your account
                            </div>
                          )}
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {formatTimeAgo(post.created_at)}
                          </div>
                        </div>
                      </button>
                      {isOwnPost && (
                        <Button variant="ghost" size="sm" onClick={() => handleDeletePost(post.id)} style={{ color: 'var(--error)' }}>
                          Delete
                        </Button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => openProfileCard(post.profile)}
                      className="mb-3 text-xs underline-offset-4 hover:underline"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      View author profile
                    </button>

                    <p style={{ color: 'var(--text-primary)' }} className="text-sm whitespace-pre-wrap mb-3">
                      {post.content}
                    </p>

                    {post.image_url && (
                      <img
                        src={post.image_url}
                        alt="Post"
                        className="w-full rounded-lg max-h-[400px] object-cover mb-3"
                        onError={(e) => {
                          console.error("Failed to load post image:", post.image_url);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}

                    <div className="flex items-center gap-4 pt-3" style={{ borderTopColor: 'var(--border)', borderTopWidth: '1px' }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => handleLike(post.id)}
                        style={{ color: isLiked ? 'var(--error)' : 'var(--text-secondary)' }}
                      >
                        <Heart className="h-4 w-4" fill={isLiked ? 'currentColor' : 'none'} />
                        <span className="text-xs">{likesCount}</span>
                      </Button>

                      <Button variant="ghost" size="sm" className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-xs">Comment</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ProfileModal
        profile={selectedProfile}
        currentUserId={currentUserId}
        open={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
      />
    </AppLayout>
  );
};

export default Dashboard;
