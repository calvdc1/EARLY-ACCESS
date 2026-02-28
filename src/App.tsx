import React, { useState, useRef, useEffect, useCallback, forwardRef, HTMLProps } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, MessageCircle, Menu, Bell, Search, Settings, Heart, LogOut, UserIcon, ChevronRight, MessageSquare, Sparkles, Clock, Globe, Info, Github, BellOff, ShieldCheck, Hash, Users, Loader2, Image as ImageIcon, MessageSquareText, Zap, Users2, BookOpen, Phone, Video, Mic, MicOff, Bot, PhoneOff } from 'lucide-react';
import { Virtuoso } from 'react-virtuoso';
import { GoogleGenAI, ThinkingLevel } from '@google/generative-ai';
import '../../index.css';

// ... [Keep all existing types and interfaces from before] ...

export default function App() {
  // ... [Keep all existing state declarations from before] ...
  
  const renderMessenger = () => {
    const totalUnread = Object.entries(unreadCounts)
      .filter(([room]) => room.startsWith('dm-') || room.startsWith('group-') || ['global', 'help-desk'].includes(room))
      .reduce((sum, [_, count]) => (sum as number) + (count as number), 0);

    return (
      <div className="h-[100dvh] bg-[#0a0502] flex flex-col md:flex-row overflow-hidden text-gray-200">
        {/* Sidebar */}
        <div className={`
          flex flex-col shrink-0 border-r border-white/5 transition-all duration-300 w-80 bg-black/20
          ${showMobileSidebar ? 'absolute inset-0 z-20 md:static' : 'hidden md:flex'}
        `}>
          {/* Header */}
          <div className="p-4 md:p-6 border-b border-white/5 flex justify-between items-center bg-black/40">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Realtime Chat
              {totalUnread > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {totalUnread}
                </span>
              )}
            </h2>
            <button 
              onClick={() => setShowMobileSidebar(false)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 bg-black/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
            {/* Direct Messages */}
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mt-4">Direct Messages</div>
            
            {/* AI Assistant */}
            <button 
              onClick={() => { setActiveRoom('dm-ai-assistant'); setShowMobileSidebar(false); }}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                activeRoom === 'dm-ai-assistant' 
                  ? 'bg-amber-500 text-black' 
                  : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <Bot size={16} />
              <span className="text-sm font-medium truncate">JARVIS AI</span>
            </button>

            {/* User DMs */}
            {directMessageList.map(dm => (
              <button
                key={dm.id}
                onClick={() => { setActiveRoom(dm.roomId); setShowMobileSidebar(false); }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all truncate ${
                  activeRoom === dm.roomId
                    ? 'bg-amber-500 text-black'
                    : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 text-xs font-bold">
                  {dm.avatar ? <img src={dm.avatar} alt="" className="w-full h-full object-cover rounded-full" /> : dm.name[0]}
                </div>
                <span className="text-sm font-medium truncate flex-1">{dm.name}</span>
                {unreadCounts[dm.roomId] > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shrink-0">
                    {unreadCounts[dm.roomId]}
                  </span>
                )}
              </button>
            ))}

            {/* Groups */}
            {joinedGroups.length > 0 && (
              <>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mt-6">Groups</div>
                {joinedGroups.map(group => {
                  const gRoom = group.name.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <button
                      key={group.id}
                      onClick={() => { setActiveRoom(gRoom); setShowMobileSidebar(false); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all truncate ${
                        activeRoom === gRoom
                          ? 'bg-amber-500 text-black'
                          : 'text-gray-400 hover:bg-white/5'
                      }`}
                    >
                      <div className="w-8 h-8 rounded bg-amber-500/20 flex items-center justify-center shrink-0 text-xs font-bold">
                        {group.logo_url ? <img src={group.logo_url} alt="" className="w-full h-full object-cover rounded" /> : group.name[0]}
                      </div>
                      <span className="text-sm font-medium truncate flex-1">{group.name}</span>
                      {unreadCounts[gRoom] > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shrink-0">
                          {unreadCounts[gRoom]}
                        </span>
                      )}
                    </button>
                  );
                })}
              </>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-white/5 bg-black/40 flex items-center gap-2">
            <button 
              onClick={() => setView('profile')}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all"
              title="Profile"
            >
              <UserIcon size={16} />
            </button>
            <button 
              onClick={() => { setUser(null); setView('home'); }}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-rose-400 hover:bg-rose-500/20 transition-all"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
            <button 
              onClick={() => setView('dashboard')}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all ml-auto"
              title="Back"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className={`
          flex-1 flex flex-col min-w-0 h-full transition-all duration-300
          ${showMobileSidebar ? 'hidden md:flex' : 'flex'}
        `}>
          {/* Chat Header */}
          <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-3 min-w-0">
              <button 
                onClick={() => setShowMobileSidebar(true)}
                className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white"
              >
                <ChevronRight className="rotate-180" size={20} />
              </button>
              <div className="min-w-0">
                <h3 className="font-bold text-white capitalize truncate">
                  {activeRoom === 'dm-ai-assistant' 
                    ? 'JARVIS AI'
                    : directMessageList.find(d => d.roomId === activeRoom)?.name || activeRoom.replace(/-/g, ' ')}
                </h3>
                <p className="text-xs text-gray-500">
                  {activeRoom.startsWith('dm') ? 'Direct Message' : 'Group'}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-4 md:p-6">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-gray-500">
                <div>
                  <MessageCircle className="mx-auto mb-3 opacity-50" size={32} />
                  <p className="text-sm">No messages yet. Start a conversation!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-w-3xl mx-auto">
                {messages.map((msg, idx) => {
                  const isMe = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                        {!isMe && (
                          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                            {msg.sender_name?.[0] || '?'}
                          </div>
                        )}
                        <div className="flex flex-col gap-1">
                          {!isMe && <p className="text-xs text-gray-500 px-3">{msg.sender_name}</p>}
                          <div className={`px-4 py-2 rounded-2xl ${
                            isMe
                              ? 'bg-amber-500 text-black rounded-tr-none'
                              : 'bg-white/10 text-white rounded-tl-none'
                          }`}>
                            <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                          </div>
                          <p className="text-xs text-gray-500 px-3">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 md:p-6 bg-black/40 border-t border-white/5">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.currentTarget.elements.namedItem('message') as HTMLInputElement;
                if (input && input.value.trim()) {
                  sendMessage(input.value);
                  input.value = '';
                }
              }}
              className="flex items-center gap-2 max-w-3xl mx-auto"
            >
              <input 
                name="message"
                type="text"
                placeholder="Type a message…"
                autoComplete="off"
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
              />
              <button 
                type="submit"
                disabled={isSending}
                className="p-3 rounded-2xl bg-amber-500 text-black hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // ... [Rest of the component continues] ...