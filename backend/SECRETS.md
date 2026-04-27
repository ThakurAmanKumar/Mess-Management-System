Local secrets

- Do NOT commit secrets into `backend/.env`.
- Use `backend/.env.local` for local development secrets (this file is ignored by git).
- If you accidentally commit secrets, rotate them and remove them from history.

Admin credentials created for local testing (stored in `backend/.env.local`):
- Email: admin@local.test
- Password: AdminPass123

Remove these from files before pushing to a remote repository.
