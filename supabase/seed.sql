insert into public.products (id, name)
values
  ('p1', 'NIAT'),
  ('p2', 'Intensive'),
  ('p3', 'Academy')
on conflict (id) do nothing;

insert into public.departments (id, name, product_id)
values
  ('d1', 'Placement', 'p1'),
  ('d2', 'Academics', 'p1'),
  ('d3', 'Operations', 'p2'),
  ('d4', 'Instructor', 'p2'),
  ('d5', 'Support', 'p3'),
  ('d6', 'Content', 'p3')
on conflict (id) do nothing;

