-- Create database triggers for notifications

-- Function to create notification for connection request
CREATE OR REPLACE FUNCTION public.notify_connection_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (
    NEW.receiver_id,
    'connection_request',
    'New Connection Request',
    (SELECT name FROM profiles WHERE user_id = NEW.sender_id) || ' sent you a connection request',
    '/connections'
  );
  RETURN NEW;
END;
$$;

-- Function to create notification for connection accepted
CREATE OR REPLACE FUNCTION public.notify_connection_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (
      NEW.sender_id,
      'connection_accepted',
      'Connection Request Accepted',
      (SELECT name FROM profiles WHERE user_id = NEW.receiver_id) || ' accepted your connection request',
      '/connections'
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for connection request
CREATE TRIGGER on_connection_request
  AFTER INSERT ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_connection_request();

-- Trigger for connection accepted
CREATE TRIGGER on_connection_status_update
  AFTER UPDATE ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_connection_accepted();

-- Enable realtime for connections and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.connections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
