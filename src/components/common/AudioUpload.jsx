/**
 * 🎵 Composant d'upload audio pour preview SmartLink
 * Upload MP3 30 secondes max pour le bouton play
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  IconButton,
  Card,
  CardContent
} from '@mui/material';
import {
  CloudUpload,
  PlayArrow,
  Pause,
  Delete,
  VolumeUp
} from '@mui/icons-material';
import API_CONFIG from '../../config/api.config';

const AudioUpload = ({ value, onChange, error, helperText }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audioInfo, setAudioInfo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);

  // Nettoyage lors du démontage
  useEffect(() => {
    return () => {
      if (audioInfo?.url) {
        URL.revokeObjectURL(audioInfo.url);
      }
    };
  }, [audioInfo?.url]);

  // Validation du fichier audio renforcée
  const validateAudioFile = (file) => {
    const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/x-wav'];
    const validExtensions = ['.mp3', '.wav'];
    const maxSize = 10 * 1024 * 1024; // 10MB max
    const minSize = 1024; // 1KB minimum pour éviter les fichiers vides
    const maxDuration = 35; // 35 secondes max pour être sûr

    // Validation du type MIME
    if (!validTypes.includes(file.type)) {
      throw new Error('Format non supporté. Utilisez des fichiers MP3 ou WAV uniquement.');
    }

    // Validation de l'extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    if (!hasValidExtension) {
      throw new Error('Extension de fichier invalide. Utilisez .mp3 ou .wav uniquement.');
    }

    // Validation de la taille
    if (file.size < minSize) {
      throw new Error('Fichier trop petit. Veuillez sélectionner un fichier audio valide.');
    }

    if (file.size > maxSize) {
      throw new Error('Fichier trop volumineux. Maximum 10MB autorisé.');
    }

    // Validation basique du contenu (signature de fichier)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function(e) {
        const arr = new Uint8Array(e.target.result.slice(0, 4));
        let header = '';
        for (let i = 0; i < arr.length; i++) {
          header += arr[i].toString(16);
        }
        
        // Vérifier les signatures de fichiers audio
        const mp3Signatures = ['fff3', 'fff2', 'fffa', 'fffb']; // MP3 signatures
        const wavSignature = '52494646'; // WAV signature "RIFF"
        
        const isValidMP3 = mp3Signatures.some(sig => header.startsWith(sig));
        const isValidWAV = header.startsWith(wavSignature);
        
        if (!isValidMP3 && !isValidWAV) {
          reject(new Error('Fichier audio corrompu ou format invalide. Veuillez utiliser un fichier MP3 ou WAV valide.'));
        } else {
          resolve(true);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Impossible de lire le fichier. Veuillez réessayer.'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  // Obtenir les infos du fichier audio
  const getAudioInfo = (file) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      
      audio.onloadedmetadata = () => {
        const info = {
          name: file.name,
          size: file.size,
          duration: audio.duration,
          url: url
        };
        
        if (audio.duration > 35) {
          reject(new Error('L\'audio ne doit pas dépasser 30 secondes.'));
        } else {
          resolve(info);
        }
      };
      
      audio.onerror = () => {
        reject(new Error('Impossible de lire le fichier audio.'));
      };
      
      audio.src = url;
    });
  };

  // Upload vers le serveur avec gestion d'erreurs améliorée
  const uploadToServer = async (file) => {
    const formData = new FormData();
    formData.append('audio', file);

    // Gestion de l'authentification comme dans api.service.js
    const headers = {};
    
    // Gestion de l'authentification
    const token = localStorage.getItem('token');
    const bypassAuthVar = import.meta.env.VITE_BYPASS_AUTH;
    const bypassAuth = bypassAuthVar === 'true' || bypassAuthVar === true || bypassAuthVar === '"true"';
    
    if (token && token !== 'null' && token !== 'undefined' && token.length > 10) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('✅ Upload Audio: Utilisation token utilisateur');
    } else if (bypassAuth) {
      headers['Authorization'] = 'Bearer dev-bypass-token';
      console.log('✅ Upload Audio: Utilisation bypass auth');
    } else {
      console.log('❌ Upload Audio: Configuration d\'authentification manquante');
      throw new Error('Configuration d\'authentification manquante. Contactez l\'administrateur.');
    }
    
    console.log('🔄 Upload Audio: Début envoi vers serveur...');
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/upload/audio`, {
      method: 'POST',
      headers,
      body: formData
    });

    console.log('📥 Upload Audio Response Status:', response.status);
    
    if (!response.ok) {
      let errorMessage = `Erreur HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        
        // Gestion spécifique des erreurs Cloudinary
        if (errorData.error && errorData.error.includes('Cloudinary')) {
          if (errorData.error.includes('Unsupported video format') || errorData.error.includes('format')) {
            errorMessage = 'Format de fichier non supporté. Veuillez utiliser un fichier MP3 ou WAV valide.';
          } else if (errorData.error.includes('File size')) {
            errorMessage = 'Fichier trop volumineux. Maximum 10MB autorisé.';
          } else {
            errorMessage = 'Erreur de configuration du service d\'upload. Contactez l\'administrateur.';
          }
        } else {
          errorMessage = errorData.message || errorData.error || errorMessage;
        }
      } catch (e) {
        console.error('Impossible de parser la réponse d\'erreur:', e);
        // Messages d'erreur plus user-friendly selon le status
        switch (response.status) {
          case 400:
            errorMessage = 'Fichier audio invalide. Veuillez sélectionner un fichier MP3 ou WAV valide.';
            break;
          case 401:
            errorMessage = 'Session expirée. Veuillez vous reconnecter.';
            break;
          case 413:
            errorMessage = 'Fichier trop volumineux. Maximum 10MB autorisé.';
            break;
          case 415:
            errorMessage = 'Format de fichier non supporté. Utilisez MP3 ou WAV uniquement.';
            break;
          case 500:
            errorMessage = 'Erreur temporaire du serveur. Veuillez réessayer dans quelques instants.';
            break;
          case 502:
          case 503:
            errorMessage = 'Service temporairement indisponible. Réessayez dans quelques minutes.';
            break;
          default:
            errorMessage = `Erreur d'upload (${response.status}). Contactez l'administrateur si le problème persiste.`;
        }
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ Upload Audio Success:', result);
    
    // Gestion des réponses de fallback temporaire
    if (result.data && result.data.temporary) {
      console.warn('⚠️ Upload Audio: Mode fallback temporaire activé');
      console.warn('📝 Message:', result.data.message);
    }
    
    return result.data;
  };

  // Gestion de la sélection de fichier
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('🎵 AudioUpload: Début upload fichier:', file.name);

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);

      // Validation asynchrone
      await validateAudioFile(file);

      // Simulation de progression pour l'UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Upload réel vers le serveur
      const uploadResult = await uploadToServer(file);
      
      // Compléter la progression
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Obtenir les infos audio locales pour l'affichage
      try {
        const info = await getAudioInfo(file);
        setAudioInfo({
          ...info,
          serverUrl: uploadResult.audioUrl,
          duration: uploadResult.duration || info.duration,
          format: uploadResult.format
        });
      } catch (audioError) {
        console.log('⚠️ Impossible de lire localement, utilisation URL serveur uniquement');
        // Fallback : utiliser directement l'URL du serveur
        setAudioInfo({
          name: file.name,
          size: file.size,
          duration: uploadResult.duration || 30,
          url: uploadResult.audioUrl, // Utiliser directement l'URL serveur
          serverUrl: uploadResult.audioUrl,
          format: uploadResult.format
        });
      }

      // Passer l'URL du serveur au parent
      onChange(uploadResult.audioUrl);
      
    } catch (error) {
      console.error('❌ Erreur upload audio complète:', error);
      console.error('❌ Stack trace:', error.stack);
      // Afficher l'erreur à l'utilisateur
      setUploadError(error.message);
      setAudioInfo(null);
      onChange(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Lecture/pause de l'audio
  const togglePlayback = () => {
    if (!audioRef.current || !audioInfo) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Supprimer l'audio
  const handleRemove = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    
    if (audioInfo?.url) {
      URL.revokeObjectURL(audioInfo.url);
    }
    
    setAudioInfo(null);
    onChange(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format de la durée
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        🎵 Extrait Audio (Preview)
      </Typography>
      
      
      {/* Zone d'upload */}
      {!audioInfo && !isUploading && (
        <Box>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mp3,audio/mpeg,audio/wav"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          
          <Button
            variant="outlined"
            startIcon={<CloudUpload />}
            onClick={() => fileInputRef.current?.click()}
            fullWidth
            sx={{ 
              py: 3,
              borderStyle: 'dashed',
              borderWidth: 2,
              '&:hover': {
                borderStyle: 'dashed',
                borderWidth: 2,
              }
            }}
          >
            <Box textAlign="center">
              <Typography variant="body1">
                Cliquez pour ajouter un extrait audio
              </Typography>
              <Typography variant="caption" color="text.secondary">
                MP3 ou WAV • Max 30 secondes • Max 10MB
              </Typography>
            </Box>
          </Button>
        </Box>
      )}

      {/* Progression d'upload */}
      {isUploading && (
        <Box sx={{ py: 2 }}>
          <Typography variant="body2" gutterBottom>
            Upload en cours...
          </Typography>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      {/* Lecteur audio */}
      {audioInfo && (
        <Card variant="outlined">
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <IconButton 
                onClick={togglePlayback}
                color="primary"
                size="large"
              >
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
              
              <Box flex={1}>
                <Typography variant="body2" fontWeight="medium">
                  {audioInfo.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDuration(audioInfo.duration)} • {(audioInfo.size / 1024 / 1024).toFixed(1)} MB
                </Typography>
              </Box>
              
              <IconButton onClick={handleRemove} color="error">
                <Delete />
              </IconButton>
            </Box>
            
            {/* Élément audio caché */}
            <audio
              ref={audioRef}
              src={audioInfo.serverUrl || audioInfo.url}
              onEnded={() => setIsPlaying(false)}
              style={{ display: 'none' }}
              crossOrigin="anonymous"
            />
          </CardContent>
        </Card>
      )}

      {/* Message d'aide */}
      {helperText && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {helperText}
        </Typography>
      )}

      {/* Erreur */}
      {(error || uploadError) && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {uploadError || error}
        </Alert>
      )}
    </Box>
  );
};

export default AudioUpload;