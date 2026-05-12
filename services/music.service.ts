import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  doc,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from 'firebase/firestore';

export interface SongSuggestion {
  id: string;
  title: string;
  artist: string;
  suggestedBy: string;
  suggestedByName: string;
  votes: number;
  votedBy: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

export class MusicService {
  async suggestSong(userId: string, userName: string, title: string, artist: string): Promise<void> {
    await addDoc(collection(db, 'gym_playlist'), {
      title,
      artist,
      suggestedBy: userId,
      suggestedByName: userName,
      votes: 1,
      votedBy: [userId],
      status: 'pending',
      createdAt: serverTimestamp(),
    });
  }

  async voteSong(songId: string, userId: string, isUpvote: boolean): Promise<void> {
    const songRef = doc(db, 'gym_playlist', songId);
    if (isUpvote) {
      await updateDoc(songRef, {
        votes: increment(1),
        votedBy: arrayUnion(userId)
      });
    } else {
      await updateDoc(songRef, {
        votes: increment(-1),
        votedBy: arrayRemove(userId)
      });
    }
  }

  async getTopSongs(limitCount = 10): Promise<SongSuggestion[]> {
    const q = query(
      collection(db, 'gym_playlist'),
      where('status', '==', 'approved'),
      orderBy('votes', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as SongSuggestion));
  }

  async getPendingSongs(): Promise<SongSuggestion[]> {
    const q = query(
      collection(db, 'gym_playlist'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as SongSuggestion));
  }

  async updateSongStatus(songId: string, status: 'approved' | 'rejected'): Promise<void> {
    const songRef = doc(db, 'gym_playlist', songId);
    await updateDoc(songRef, { status });
  }
}

export const musicService = new MusicService();
