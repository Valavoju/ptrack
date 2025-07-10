# ProTrack Backend

Backend API for ProTrack - A comprehensive project tracking portal for engineering colleges.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Student, Faculty, and Admin roles with branch-specific access
- **Project Management**: Create, track, and manage projects across different stages (RTP/Mini/Major)
- **File Upload System**: Secure file upload with validation and storage
- **Weekly Progress Tracking**: Students can upload weekly deliverables
- **Faculty Dashboard**: Faculty can monitor and review student progress
- **Security**: Input validation, rate limiting, and secure headers

## Tech Stack

- **Node.js & Express.js**: Server framework
- **MongoDB & Mongoose**: Database and ODM
- **JWT**: Authentication
- **Multer**: File upload handling
- **bcryptjs**: Password hashing
- **Express Validator**: Input validation
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration

5. Start the server:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/auth/faculty/:branch` - Get faculty by branch
- `POST /api/auth/logout` - Logout user

### Projects
- `GET /api/projects` - Get all projects (Admin)
- `GET /api/projects/student` - Get student's projects
- `GET /api/projects/faculty` - Get faculty's projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project (Student)
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Uploads
- `GET /api/uploads/:projectId` - Get uploads for project
- `POST /api/uploads` - Create weekly upload (Student)
- `PUT /api/uploads/:id` - Update upload
- `DELETE /api/uploads/:id` - Delete upload
- `GET /api/uploads/download/:filename` - Download file

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/faculty` - Get all faculty
- `GET /api/users/students` - Get all students (Faculty/Admin)
- `PUT /api/users/:id/status` - Update user status (Admin)

## Database Schema

### User Model
- Personal information (name, email, password)
- Role-based fields (student/faculty/admin)
- Branch and year information
- Authentication timestamps

### Project Model
- Project details (title, abstract, type)
- Student and mentor relationships
- Status tracking and grading
- Technology stack and objectives

### WeeklyUpload Model
- File upload information
- Week-based progress tracking
- Review and feedback system
- Status management

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting to prevent abuse
- Input validation and sanitization
- File type and size validation
- Role-based access control
- Secure headers with Helmet

## File Upload System

- Supports PDF, DOC, DOCX, PPT, PPTX, TXT, and images
- Maximum file size: 10MB
- Maximum files per upload: 5
- User-specific directory structure
- Secure file storage and retrieval

## Environment Variables

See `.env.example` for required environment variables.

## Deployment

1. Set up MongoDB database (local or Atlas)
2. Configure environment variables
3. Build and deploy to your preferred platform
4. Ensure proper file storage permissions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.