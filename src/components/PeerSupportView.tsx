import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  ShieldCheck,
  Award,
  Heart,
  MessageSquare,
  Flag,
  Send,
  Plus,
  Search,
  Sparkles,
  CheckCircle,
  HelpCircle,
  ThumbsUp,
} from 'lucide-react';
import { PeerPost, PeerReply, UserRole } from '../types';

interface PeerSupportViewProps {
  posts: PeerPost[];
  currentRole: UserRole;
  onAddPost: (post: PeerPost) => void;
  onAddReply: (postId: string, reply: PeerReply) => void;
  onFlagPost: (postId: string, reason: string) => void;
  onUpvotePost: (postId: string) => void;
  onThankReply: (postId: string, replyId: string) => void;
}

const ROOMS = [
  { id: 'all', label: 'All Rooms', emoji: '🌟' },
  { id: 'exams', label: 'Exam & Placements', emoji: '📚' },
  { id: 'homesick', label: 'Hostel & Homesickness', emoji: '🏠' },
  { id: 'relationships', label: 'Relationships & Friends', emoji: '🫂' },
  { id: 'transitions', label: '1st Year Transitions', emoji: '🌱' },
  { id: 'research', label: 'Research & Thesis', emoji: '🔬' },
];

const RANDOM_PSEUDONYMS = [
  'QuietSparrow',
  'WarmChai',
  'SilverOak',
  'OceanBreeze',
  'GentlePanda',
  'NightOwl',
  'CosmicSprout',
  'RiverOtter',
];

export const PeerSupportView: React.FC<PeerSupportViewProps> = ({
  posts,
  currentRole,
  onAddPost,
  onAddReply,
  onFlagPost,
  onUpvotePost,
  onThankReply,
}) => {
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');

  // New post modal
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newRoom, setNewRoom] = useState<'exams' | 'homesick' | 'relationships' | 'transitions' | 'research'>('exams');

  // Flag post modal
  const [flaggingPostId, setFlaggingPostId] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState('');

  const filteredPosts = posts.filter((p) => {
    const matchesRoom = selectedRoom === 'all' || p.room === selectedRoom;
    const matchesQuery =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRoom && matchesQuery;
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const randomName = `${RANDOM_PSEUDONYMS[Math.floor(Math.random() * RANDOM_PSEUDONYMS.length)]}${Math.floor(10 + Math.random() * 89)}`;

    const newPost: PeerPost = {
      id: `post-${Date.now()}`,
      room: newRoom,
      authorPseudonym: randomName,
      isVolunteer: currentRole === 'volunteer',
      volunteerKarma: currentRole === 'volunteer' ? 120 : undefined,
      title: newTitle.trim(),
      content: newContent.trim(),
      upvotes: 1,
      helpfulCount: 0,
      replies: [],
      flaggedForReview: false,
      createdAt: 'Just now',
    };

    onAddPost(newPost);
    setNewTitle('');
    setNewContent('');
    setIsNewPostModalOpen(false);
  };

  const handleSendReply = (postId: string) => {
    if (!replyInput.trim()) return;

    const pseudonym =
      currentRole === 'volunteer'
        ? 'VerifiedVolunteerPeer'
        : `${RANDOM_PSEUDONYMS[Math.floor(Math.random() * RANDOM_PSEUDONYMS.length)]}${Math.floor(10 + Math.random() * 89)}`;

    const newReply: PeerReply = {
      id: `reply-${Date.now()}`,
      authorPseudonym: pseudonym,
      isVolunteer: currentRole === 'volunteer',
      volunteerKarma: currentRole === 'volunteer' ? 145 : undefined,
      content: replyInput.trim(),
      createdAt: 'Just now',
      thanked: false,
    };

    onAddReply(postId, newReply);
    setReplyInput('');
  };

  const handleConfirmFlag = () => {
    if (flaggingPostId && flagReason) {
      onFlagPost(flaggingPostId, flagReason);
      setFlaggingPostId(null);
      setFlagReason('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-[36px] border border-[#E8E4D9] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="font-serif italic text-2xl sm:text-3xl font-normal text-[#2D2D2B]">
              Anonymous Student Space
            </h2>
            {currentRole === 'volunteer' && (
              <span className="text-xs px-3 py-0.5 bg-[#F5D5CB] text-[#A84832] font-bold border border-[#E98A72]/40 rounded-full flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[#E98A72]" /> Peer Volunteer Active
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#7A756D] leading-relaxed">
            Share what you're navigating without judgment. Safe pseudonyms only, zero real identity tracking.
          </p>
        </div>

        <button
          id="new-peer-post-btn"
          onClick={() => setIsNewPostModalOpen(true)}
          className="py-3 px-6 bg-[#4A8B8D] hover:bg-[#376F71] active:scale-95 text-white rounded-full font-medium text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>New Anonymous Post</span>
        </button>
      </div>

      {/* Room Category Tabs & Search */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          {ROOMS.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRoom(r.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedRoom === r.id
                  ? 'bg-[#4A8B8D] text-white shadow-xs'
                  : 'bg-white text-[#7A756D] hover:bg-[#F0EDE4] border border-[#E8E4D9]'
              }`}
            >
              <span>{r.emoji}</span>
              <span>{r.label}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#7A756D] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search discussions on placements, hostel rasam, lab vivas..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-[#E8E4D9] rounded-full text-xs sm:text-sm text-[#2D2D2B] focus:outline-hidden focus:ring-2 focus:ring-[#4A8B8D]"
          />
        </div>
      </div>

      {/* Posts Stream */}
      <div className="space-y-5">
        {filteredPosts.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-[32px] border border-[#E8E4D9] text-[#7A756D] text-sm">
            No posts found in this room yet. Be the first to start a gentle conversation!
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isExpanded = activePostId === post.id;
            return (
              <div
                key={post.id}
                className={`bg-white rounded-[32px] border p-6 sm:p-7 transition-all shadow-xs space-y-4 ${
                  post.flaggedForReview
                    ? 'border-[#E98A72] bg-[#F5D5CB]/10'
                    : 'border-[#E8E4D9] hover:border-[#4A8B8D]/40'
                }`}
              >
                {/* Post Author Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#D1E5E6] text-[#1F4647] font-bold text-xs flex items-center justify-center">
                      {post.authorPseudonym.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-[#2D2D2B]">
                          {post.authorPseudonym}
                        </span>
                        {post.isVolunteer && (
                          <span className="text-[10px] px-2 py-0.5 bg-[#D1E5E6]/60 text-[#1F4647] font-semibold border border-[#4A8B8D]/30 rounded-full flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-[#4A8B8D]" />
                            Volunteer ({post.volunteerKarma} karma)
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#7A756D]">{post.createdAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-[#F0EDE4] text-[#4A8B8D] rounded-full border border-[#E8E4D9]">
                      {post.room}
                    </span>

                    {/* Volunteer Flag to Human Queue */}
                    {currentRole === 'volunteer' && (
                      <button
                        onClick={() => setFlaggingPostId(post.id)}
                        className="text-[11px] text-[#E98A72] hover:text-[#A84832] hover:bg-[#F5D5CB]/30 px-2.5 py-1 rounded-full border border-[#E98A72]/40 flex items-center gap-1 cursor-pointer"
                        title="Flag for counsellor human review"
                      >
                        <Flag className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Flag for review</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Flagged banner note */}
                {post.flaggedForReview && (
                  <div className="p-3 bg-[#F5D5CB]/40 border border-[#E98A72]/50 rounded-[20px] text-xs text-[#A84832] flex items-center gap-2">
                    <Flag className="w-4 h-4 text-[#E98A72] shrink-0" />
                    <span>
                      Flagged by peer volunteer for compassionate counsellor review. It remains visible while human review is scheduled.
                    </span>
                  </div>
                )}

                {/* Post Content */}
                <div>
                  <h4 className="text-base sm:text-lg font-serif font-bold text-[#2D2D2B]">
                    {post.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#3D3A35] mt-1.5 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>

                {/* Post Interactions */}
                <div className="pt-3 border-t border-[#E8E4D9] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onUpvotePost(post.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                        post.hasUpvoted
                          ? 'bg-[#D1E5E6] text-[#1F4647] border border-[#4A8B8D]/30'
                          : 'text-[#7A756D] hover:bg-[#F0EDE4]'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{post.upvotes}</span>
                    </button>

                    <button
                      onClick={() => setActivePostId(isExpanded ? null : post.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-[#7A756D] hover:bg-[#F0EDE4] rounded-full transition-colors cursor-pointer font-medium"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{post.replies.length} replies</span>
                    </button>
                  </div>

                  <span className="text-xs text-[#4A8B8D] font-medium">
                    {post.helpfulCount} students found this comforting 🫂
                  </span>
                </div>

                {/* Replies Thread */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-4 border-t border-[#E8E4D9] space-y-3.5"
                    >
                      {/* Replies List */}
                      {post.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="p-4 bg-[#F9F7F2] rounded-[24px] border border-[#E8E4D9] space-y-2 text-xs sm:text-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#2D2D2B]">
                                {reply.authorPseudonym}
                              </span>
                              {reply.isVolunteer && (
                                <span className="text-[10px] px-2 py-0.5 bg-[#D1E5E6] text-[#1F4647] font-bold rounded-full flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3 text-[#4A8B8D]" />
                                  Volunteer ({reply.volunteerKarma} Karma)
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#7A756D]">{reply.createdAt}</span>
                          </div>

                          <p className="text-[#3D3A35] leading-relaxed">{reply.content}</p>

                          <div className="pt-1 flex items-center justify-end">
                            <button
                              onClick={() => onThankReply(post.id, reply.id)}
                              className={`text-[11px] font-semibold px-3 py-1 rounded-full transition-colors cursor-pointer flex items-center gap-1.5 ${
                                reply.thanked
                                  ? 'bg-[#F5D5CB] text-[#A84832] border border-[#E98A72]/40'
                                  : 'text-[#7A756D] hover:text-[#E98A72]'
                              }`}
                            >
                              <Heart className="w-3 h-3 text-[#E98A72]" />
                              <span>{reply.thanked ? 'Thanked ❤️' : 'Say Thanks'}</span>
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Reply Input Bar */}
                      <div className="flex items-center gap-2.5 pt-1">
                        <input
                          type="text"
                          value={replyInput}
                          onChange={(e) => setReplyInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSendReply(post.id);
                          }}
                          placeholder={
                            currentRole === 'volunteer'
                              ? 'Reply as verified peer volunteer...'
                              : 'Leave an anonymous encouraging reply...'
                          }
                          className="flex-1 px-4 py-2.5 bg-[#F9F7F2] border border-[#E8E4D9] rounded-full text-xs sm:text-sm text-[#2D2D2B] focus:outline-hidden focus:ring-2 focus:ring-[#4A8B8D]"
                        />
                        <button
                          onClick={() => handleSendReply(post.id)}
                          className="p-2.5 bg-[#4A8B8D] hover:bg-[#376F71] text-white rounded-full cursor-pointer transition-colors"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* New Post Modal */}
      <AnimatePresence>
        {isNewPostModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2D2D2B]/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-[36px] shadow-2xl border border-[#E8E4D9] overflow-hidden"
            >
              <div className="p-5 bg-[#4A8B8D] text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-[#F5D5CB]" />
                  <h4 className="font-serif italic text-lg font-bold">Create Anonymous Post</h4>
                </div>
                <button
                  onClick={() => setIsNewPostModalOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-full text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#2D2D2B] mb-1.5">Room / Topic</label>
                  <select
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value as any)}
                    className="w-full p-3 bg-[#F9F7F2] border border-[#E8E4D9] rounded-xl text-xs font-medium text-[#2D2D2B]"
                  >
                    <option value="exams">📚 Exam Stress & Placements</option>
                    <option value="homesick">🏠 Hostel Life & Homesickness</option>
                    <option value="relationships">🫂 Relationships & Friends</option>
                    <option value="transitions">🌱 1st Year Transitions</option>
                    <option value="research">🔬 Research & Thesis Druck</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2D2B] mb-1.5">Title / Headline</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Dealing with placement anxiety when friends get Day-1 offers"
                    className="w-full p-3 bg-[#F9F7F2] border border-[#E8E4D9] rounded-xl text-xs font-medium text-[#2D2D2B]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2D2B] mb-1.5">
                    Your Thoughts (Posted with auto-generated safe pseudonym)
                  </label>
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    rows={4}
                    placeholder="Share what is on your mind freely. No professors or admins can see who posted this."
                    className="w-full p-3 bg-[#F9F7F2] border border-[#E8E4D9] rounded-xl text-xs font-medium text-[#2D2D2B] resize-none"
                    required
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewPostModalOpen(false)}
                    className="flex-1 py-3 bg-[#F0EDE4] hover:bg-[#E8E4D9] text-[#3D3A35] text-xs font-semibold rounded-full"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#4A8B8D] hover:bg-[#376F71] text-white text-xs font-semibold rounded-full shadow-xs"
                  >
                    Post Anonymously
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Flag Post Modal */}
      <AnimatePresence>
        {flaggingPostId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2D2D2B]/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-[36px] shadow-2xl border border-[#E8E4D9] overflow-hidden"
            >
              <div className="p-5 bg-[#E98A72] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flag className="w-5 h-5 text-white" />
                  <h4 className="font-serif italic text-base font-bold">Flag Post for Human Moderator Review</h4>
                </div>
                <button
                  onClick={() => setFlaggingPostId(null)}
                  className="p-1 hover:bg-white/20 rounded-full text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs sm:text-sm text-[#7A756D] leading-relaxed">
                  As a peer volunteer, you can flag concerning posts to the campus counsellor's moderation queue. 
                  <strong> Note:</strong> This will never auto-delete the post or escalate without trained human review.
                </p>

                <div>
                  <label className="block text-xs font-bold text-[#2D2D2B] mb-1.5">Reason for Flagging</label>
                  <select
                    value={flagReason}
                    onChange={(e) => setFlagReason(e.target.value)}
                    className="w-full p-3 bg-[#F9F7F2] border border-[#E8E4D9] rounded-xl text-xs text-[#2D2D2B]"
                  >
                    <option value="">Select a reason...</option>
                    <option value="High distress / feeling hopeless">High distress / feeling hopeless</option>
                    <option value="Potential self-harm concern">Potential self-harm concern</option>
                    <option value="Hostel harassment or bullying">Hostel harassment or bullying</option>
                    <option value="Academic crisis / dropout consideration">Academic crisis / dropout consideration</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setFlaggingPostId(null)}
                    className="flex-1 py-3 bg-[#F0EDE4] hover:bg-[#E8E4D9] text-[#3D3A35] text-xs font-semibold rounded-full"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmFlag}
                    disabled={!flagReason}
                    className="flex-1 py-3 bg-[#E98A72] hover:bg-[#D36B51] disabled:opacity-50 text-white text-xs font-semibold rounded-full"
                  >
                    Send to Counsellor Queue
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
