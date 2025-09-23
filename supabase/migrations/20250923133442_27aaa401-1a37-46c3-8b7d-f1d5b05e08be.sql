-- Update the existing user's role to admin
UPDATE public.user_roles 
SET role = 'admin'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'rac.matic@gmail.com'
);