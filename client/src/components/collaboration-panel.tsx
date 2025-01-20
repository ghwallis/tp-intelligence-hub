import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { User, Collaborator, CollaborationEvent } from "@db/schema";

interface CollaborationPanelProps {
  documentId: number;
}

interface CollaborationMessage {
  type: 'join' | 'leave' | 'cursor' | 'edit' | 'comment';
  sessionId: number;
  userId: number;
  content: any;
}

const CURSOR_UPDATE_INTERVAL = 100;

export function CollaborationPanel({ documentId }: CollaborationPanelProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [cursorPositions, setCursorPositions] = useState<Record<number, { x: number; y: number }>>({});

  // Create or join collaboration session
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/collaboration/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: (session) => {
      setSessionId(session.id);
      initializeWebSocket(session.id);
    },
    onError: (error: Error) => {
      toast({
        title: "Collaboration Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Query active collaborators
  const { data: collaborators } = useQuery({
    queryKey: ['/api/collaboration/sessions', sessionId, 'collaborators'],
    queryFn: async () => {
      if (!sessionId) return [];
      const response = await fetch(`/api/collaboration/sessions/${sessionId}/collaborators`);
      return response.json();
    },
    enabled: !!sessionId,
  });

  useEffect(() => {
    // Initialize collaboration session when component mounts
    createSessionMutation.mutate();

    // Cleanup WebSocket connection when component unmounts
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const initializeWebSocket = (sid: number) => {
    const socket = new WebSocket(`ws://${window.location.host}/ws/collaboration?sessionId=${sid}`);

    socket.onopen = () => {
      socket.send(JSON.stringify({
        type: 'join',
        sessionId: sid,
        userId: user?.id,
        content: null,
      }));
    };

    socket.onmessage = (event) => {
      const message: CollaborationMessage = JSON.parse(event.data);
      handleCollaborationMessage(message);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to collaboration server",
        variant: "destructive",
      });
    };

    setWs(socket);
  };

  const handleCollaborationMessage = (message: CollaborationMessage) => {
    switch (message.type) {
      case 'cursor':
        setCursorPositions(prev => ({
          ...prev,
          [message.userId]: message.content
        }));
        break;
      case 'edit':
      case 'comment':
        queryClient.invalidateQueries({ queryKey: ['/api/collaboration/sessions', sessionId, 'events'] });
        break;
    }
  };

  // Track and broadcast cursor position
  useEffect(() => {
    if (!ws || !user?.id) return;

    const handleMouseMove = (e: MouseEvent) => {
      const content = {
        x: e.clientX,
        y: e.clientY,
      };

      ws.send(JSON.stringify({
        type: 'cursor',
        sessionId: sessionId,
        userId: user.id,
        content,
      }));
    };

    const throttledHandleMouseMove = throttle(handleMouseMove, CURSOR_UPDATE_INTERVAL);
    document.addEventListener('mousemove', throttledHandleMouseMove);

    return () => {
      document.removeEventListener('mousemove', throttledHandleMouseMove);
    };
  }, [ws, user?.id, sessionId]);

  return (
    <Card className="fixed right-4 top-4 w-64 p-4 shadow-lg">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Collaborators</h3>
          <Badge variant="secondary">
            {collaborators?.length || 0} Active
          </Badge>
        </div>

        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {collaborators?.map((collaborator: Collaborator & { user: User }) => (
              <div
                key={collaborator.userId}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${collaborator.user.username}`}
                    alt={collaborator.user.username}
                  />
                  <AvatarFallback>
                    {collaborator.user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {collaborator.user.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {collaborator.status}
                  </p>
                </div>
                {collaborator.status === 'online' && (
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Render cursor positions for other users */}
      {Object.entries(cursorPositions).map(([userId, position]) => (
        userId !== user?.id?.toString() && (
          <div
            key={userId}
            className="fixed pointer-events-none"
            style={{
              left: position.x,
              top: position.y,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="h-4 w-4 border-2 border-primary rounded-full" />
          </div>
        )
      ))}
    </Card>
  );
}

// Utility function to throttle mouse move events
function throttle(func: Function, limit: number) {
  let inThrottle: boolean;
  return function(...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
