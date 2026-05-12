'use client';
import { useState, useEffect } from 'react';
import { musicService, SongSuggestion } from '@/services/music.service';
import { motion, AnimatePresence } from 'framer-motion';

interface GymPlaylistProps {
  userId: string;
  userName: string;
}

export default function GymPlaylist({ userId, userName }: GymPlaylistProps) {
  const [songs, setSongs] = useState<SongSuggestion[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [newSong, setNewSong] = useState({ title: '', artist: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const data = await musicService.getTopSongs(10);
      setSongs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSong.title || !newSong.artist) return;
    setLoading(true);
    try {
      await musicService.suggestSong(userId, userName, newSong.title, newSong.artist);
      setNewSong({ title: '', artist: '' });
      setIsSuggesting(false);
      alert('¡Sugerencia enviada! Estará disponible después de la moderación.');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (songId: string, currentlyVoted: boolean) => {
    try {
      await musicService.voteSong(songId, userId, !currentlyVoted);
      // Optimistic update
      setSongs(prev => prev.map(s => {
        if (s.id === songId) {
          const newVoters = currentlyVoted ? s.votedBy.filter(id => id !== userId) : [...s.votedBy, userId];
          return { ...s, votes: currentlyVoted ? s.votes - 1 : s.votes + 1, votedBy: newVoters };
        }
        return s;
      }));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-surface-container-low rounded-[2rem] p-8 ghost-border space-y-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <span className="material-symbols-outlined text-[100px] text-primary">queue_music</span>
      </div>

      <div className="flex justify-between items-center relative z-10">
        <div>
          <h3 className="font-headline font-black text-2xl uppercase tracking-tighter italic">Playlist de la Comunidad</h3>
          <p className="font-label text-[10px] uppercase tracking-widest text-tertiary">Elegí la música para tu entrenamiento</p>
        </div>
        <button 
          onClick={() => setIsSuggesting(!isSuggesting)}
          className="bg-primary/10 text-primary p-3 rounded-xl hover:bg-primary hover:text-white transition-all flex items-center gap-2 font-label text-[10px] font-black uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-sm">{isSuggesting ? 'close' : 'add'}</span>
          {isSuggesting ? 'Cerrar' : 'Sugerir'}
        </button>
      </div>

      <AnimatePresence>
        {isSuggesting && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSuggest}
            className="space-y-4 bg-surface-container-high/50 p-6 rounded-2xl relative z-10 border border-primary/20 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                required
                placeholder="Título de la canción"
                value={newSong.title}
                onChange={e => setNewSong({...newSong, title: e.target.value})}
                className="w-full bg-surface-container-lowest p-4 rounded-xl outline-none font-body text-sm border border-white/5 focus:border-primary transition-all"
              />
              <input 
                required
                placeholder="Artista"
                value={newSong.artist}
                onChange={e => setNewSong({...newSong, artist: e.target.value})}
                className="w-full bg-surface-container-lowest p-4 rounded-xl outline-none font-body text-sm border border-white/5 focus:border-primary transition-all"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-primary text-white py-4 rounded-xl font-label text-[10px] font-black uppercase tracking-[0.2em] shadow-glow"
            >
              Enviar Sugerencia
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-3 relative z-10">
        {songs.length === 0 && !loading ? (
          <div className="py-10 text-center opacity-30 italic font-body text-sm">
            No hay canciones aprobadas todavía. ¡Sugerí la primera!
          </div>
        ) : (
          songs.map((song, index) => {
            const hasVoted = song.votedBy.includes(userId);
            return (
              <motion.div 
                key={song.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between bg-surface-container-highest/20 p-4 rounded-2xl border border-white/5 group hover:bg-surface-container-high transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center font-headline font-black text-xs text-primary/50 italic">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-headline text-sm font-bold uppercase tracking-tight">{song.title}</h4>
                    <p className="font-body text-[10px] text-tertiary italic">{song.artist}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <span className="font-headline text-lg font-black text-primary italic leading-none">{song.votes}</span>
                    <span className="font-label text-[8px] uppercase font-bold text-tertiary">Votos</span>
                  </div>
                  <button 
                    onClick={() => handleVote(song.id, hasVoted)}
                    className={`material-symbols-outlined rounded-full p-2 transition-all ${hasVoted ? 'bg-primary text-white shadow-glow' : 'bg-surface-container-highest text-tertiary hover:bg-primary/20 hover:text-primary'}`}
                  >
                    {hasVoted ? 'thumb_up' : 'expand_less'}
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
