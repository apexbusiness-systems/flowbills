-- Update the user's role back to viewer
UPDATE public.user_roles 
SET role = 'viewer'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'rac.matic@gmail.com'
);