/**
 * Servicio RON Video - Gestión completa de videollamadas para notarización remota
 */

import { Response } from 'express';
import { generateRtcToken, RtcRole } from './agora-token-generator';
import { db } from '../db';
import { ronSessions, documents, users } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

// Configuración de Agora
const appId = process.env.AGORA_APP_ID || 'demo-app-id';
const appCertificate = process.env.AGORA_APP_CERTIFICATE || 'demo-certificate';
const expirationTimeInSeconds = 3600; // 1 hora

interface RonSessionData {
  id: string;
  channelName: string;
  certifierId: number;
  clientId: number;
  documentId: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  scheduledAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  recordingUrl?: string;
}

/**
 * Crear una nueva sesión RON
 */
export const createRonSession = async (
  certifierId: number,
  clientId: number,
  documentId: number,
  scheduledAt: Date
): Promise<RonSessionData> => {
  try {
    // Generar un canal único
    const channelName = `ron-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const [newSession] = await db.insert(ronSessions).values({
      channelName,
      certifierId,
      clientId,
      documentId,
      status: 'scheduled',
      scheduledAt,
      createdAt: new Date()
    }).returning();

    return {
      id: newSession.id.toString(),
      channelName: newSession.channelName,
      certifierId: newSession.certifierId,
      clientId: newSession.clientId,
      documentId: newSession.documentId,
      status: newSession.status as any,
      scheduledAt: newSession.scheduledAt,
      startedAt: newSession.startedAt,
      endedAt: newSession.endedAt,
      recordingUrl: newSession.recordingUrl
    };
  } catch (error) {
    console.error('Error al crear sesión RON:', error);
    throw new Error('No se pudo crear la sesión RON');
  }
};

/**
 * Obtener tokens de video para una sesión RON
 */
export const getRonVideoTokens = async (
  sessionId: string,
  userId: number
): Promise<{
  success: boolean;
  appId: string;
  channelName: string;
  token: string;
  uid: number;
  role: 'certifier' | 'client';
  session: RonSessionData;
}> => {
  try {
    // Obtener información de la sesión
    const [session] = await db
      .select()
      .from(ronSessions)
      .where(eq(ronSessions.id, parseInt(sessionId)));

    if (!session) {
      throw new Error('Sesión RON no encontrada');
    }

    // Verificar que el usuario tiene acceso a esta sesión
    const isCertifier = session.certifierId === userId;
    const isClient = session.clientId === userId;
    
    if (!isCertifier && !isClient) {
      throw new Error('Acceso denegado a esta sesión RON');
    }

    // Determinar UID y rol
    const uid = isCertifier ? 1 : 2;
    const role = isCertifier ? 'certifier' : 'client';
    
    // Generar token
    let token = 'demo-token';
    
    if (appId !== 'demo-app-id' && appCertificate !== 'demo-certificate') {
      token = generateRtcToken(
        appId,
        appCertificate,
        session.channelName,
        uid,
        RtcRole.PUBLISHER,
        expirationTimeInSeconds
      );
    }

    // Actualizar estado de la sesión si es la primera vez que se accede
    if (session.status === 'scheduled') {
      await db
        .update(ronSessions)
        .set({ 
          status: 'active',
          startedAt: new Date()
        })
        .where(eq(ronSessions.id, parseInt(sessionId)));
    }

    return {
      success: true,
      appId,
      channelName: session.channelName,
      token,
      uid,
      role,
      session: {
        id: session.id.toString(),
        channelName: session.channelName,
        certifierId: session.certifierId,
        clientId: session.clientId,
        documentId: session.documentId,
        status: session.status as any,
        scheduledAt: session.scheduledAt,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        recordingUrl: session.recordingUrl
      }
    };

  } catch (error) {
    console.error('Error al obtener tokens RON:', error);
    throw error;
  }
};

/**
 * Finalizar una sesión RON
 */
export const finishRonSession = async (
  sessionId: string,
  userId: number,
  recordingUrl?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const [session] = await db
      .select()
      .from(ronSessions)
      .where(eq(ronSessions.id, parseInt(sessionId)));

    if (!session) {
      throw new Error('Sesión RON no encontrada');
    }

    // Solo el certificador puede finalizar la sesión
    if (session.certifierId !== userId) {
      throw new Error('Solo el certificador puede finalizar la sesión');
    }

    // Actualizar sesión
    await db
      .update(ronSessions)
      .set({
        status: 'completed',
        endedAt: new Date(),
        recordingUrl: recordingUrl || null
      })
      .where(eq(ronSessions.id, parseInt(sessionId)));

    // Actualizar documento como certificado
    await db
      .update(documents)
      .set({
        status: 'certified',
        updatedAt: new Date()
      })
      .where(eq(documents.id, session.documentId));

    return {
      success: true,
      message: 'Sesión RON finalizada correctamente'
    };

  } catch (error) {
    console.error('Error al finalizar sesión RON:', error);
    throw error;
  }
};

/**
 * Obtener sesiones RON de un certificador
 */
export const getCertifierSessions = async (
  certifierId: number,
  status?: string
): Promise<RonSessionData[]> => {
  try {
    let query = db
      .select()
      .from(ronSessions)
      .where(eq(ronSessions.certifierId, certifierId));

    if (status) {
      query = query.where(and(
        eq(ronSessions.certifierId, certifierId),
        eq(ronSessions.status, status)
      ));
    }

    const sessions = await query.orderBy(ronSessions.scheduledAt);

    return sessions.map(session => ({
      id: session.id.toString(),
      channelName: session.channelName,
      certifierId: session.certifierId,
      clientId: session.clientId,
      documentId: session.documentId,
      status: session.status as any,
      scheduledAt: session.scheduledAt,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      recordingUrl: session.recordingUrl
    }));

  } catch (error) {
    console.error('Error al obtener sesiones del certificador:', error);
    return [];
  }
};

/**
 * Obtener información completa de una sesión RON
 */
export const getRonSessionInfo = async (
  sessionId: string
): Promise<{
  session: RonSessionData;
  certifier: any;
  client: any;
  document: any;
} | null> => {
  try {
    const [session] = await db
      .select()
      .from(ronSessions)
      .where(eq(ronSessions.id, parseInt(sessionId)));

    if (!session) {
      return null;
    }

    // Obtener información del certificador
    const [certifier] = await db
      .select({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        email: users.email
      })
      .from(users)
      .where(eq(users.id, session.certifierId));

    // Obtener información del cliente
    const [client] = await db
      .select({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        email: users.email
      })
      .from(users)
      .where(eq(users.id, session.clientId));

    // Obtener información del documento
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, session.documentId));

    return {
      session: {
        id: session.id.toString(),
        channelName: session.channelName,
        certifierId: session.certifierId,
        clientId: session.clientId,
        documentId: session.documentId,
        status: session.status as any,
        scheduledAt: session.scheduledAt,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        recordingUrl: session.recordingUrl
      },
      certifier,
      client,
      document
    };

  } catch (error) {
    console.error('Error al obtener información de sesión RON:', error);
    return null;
  }
};

/**
 * Verificar si las credenciales de Agora están configuradas
 */
export const isAgoraConfigured = (): boolean => {
  return appId !== 'demo-app-id' && appCertificate !== 'demo-certificate';
};

/**
 * Obtener configuración de demo para pruebas
 */
export const getDemoConfig = () => {
  return {
    appId: 'demo-app-id',
    demoMode: true,
    message: 'Modo demo - Configure AGORA_APP_ID y AGORA_APP_CERTIFICATE para producción'
  };
};