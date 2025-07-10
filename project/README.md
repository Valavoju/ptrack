# ProTrack - Project Tracking Portal

A comprehensive project tracking portal designed for engineering colleges to manage and monitor student projects across different academic stages.

## 🚀 Features

### Core Functionality
- **Multi-Stage Project Tracking**: Support for Real-Time Projects (2nd year), Mini Projects (3rd year), and Major Projects (4th year)
- **Role-Based Access Control**: Separate interfaces for Students, Faculty, and Administrators
- **Branch-Specific Mentor Assignment**: Students can only select faculty mentors from their branch
- **Weekly Progress Tracking**: Students upload weekly deliverables with Notion-style progress visualization
- **File Upload System**: Secure handling of PDF, DOC, PPT, and image files
- **Real-Time Notifications**: Faculty receive notifications when students upload files

### User Roles & Permissions
- **Students**: Create projects, upload weekly progress, view their own dashboard
- **Faculty**: Monitor assigned students, review uploads, provide feedback and grades
- **Admin**: Manage users, view system-wide statistics, clean old data

### Security Features
- JWT-based authentication with bcrypt password hashing
- Input validation and sanitization
- Rate limiting and secure headers
- Role-based access control
- File type and size validation

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Hook Form** with Yup validation
- **React Router DOM** for navigation
- **Axios** for API calls
- **React Hot Toast** for notifications

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing
- **Express Validator** for input validation
- **Helmet** for security headers
- **CORS** for cross-origin requests

### Database Schema
- **Users**: Student/Faculty information with branch association
- **Projects**: Project details with mentor-student relationships
- **WeeklyUploads**: File uploads with progress tracking

## 📋 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Frontend Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your API URL

5. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration:
   - MongoDB connection string
   - JWT secret key
   - Other environment variables

5. Start the server:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🚀 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy

### Backend (Render/Railway)
1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables
4. Deploy

### Database (MongoDB Atlas)
1. Create MongoDB Atlas account
2. Create cluster and database
3. Get connection string
4. Update backend environment variables

## 📝 Usage

### For Students
1. Register with student credentials (Student ID, Year, Branch)
2. Create projects and select mentors from your branch
3. Upload weekly progress files
4. Track project progress in dashboard
5. View feedback from faculty

### For Faculty
1. Register with faculty credentials
2. View dashboard with assigned students
3. Monitor student progress and uploads
4. Provide feedback and grades
5. Receive notifications for new uploads

### For Administrators
1. Access admin dashboard
2. Manage users and projects
3. View system-wide statistics
4. Clean old data and maintain system

## 🔧 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/auth/faculty/:branch` - Get faculty by branch

### Project Management
- `GET /api/projects/student` - Get student's projects
- `GET /api/projects/faculty` - Get faculty's projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### File Upload System
- `POST /api/uploads` - Upload weekly files
- `GET /api/uploads/:projectId` - Get project uploads
- `PUT /api/uploads/:id` - Update upload
- `GET /api/uploads/download/:filename` - Download file

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6) for main actions
- **Secondary**: Teal (#14B8A6) for accents
- **Success**: Green (#10B981) for positive states
- **Warning**: Orange (#F59E0B) for alerts
- **Error**: Red (#EF4444) for errors
- **Neutral**: Gray shades for text and backgrounds

### Typography
- **Headings**: 120% line height, bold weights
- **Body**: 150% line height, regular weights
- **Maximum 3 font weights** for consistency

### Components
- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Gradient backgrounds with hover effects
- **Forms**: Clean inputs with proper validation
- **Animations**: Smooth transitions with Framer Motion

## 🔐 Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens for secure authentication
- Input validation on all endpoints
- File type and size restrictions
- Rate limiting to prevent abuse
- CORS configuration for frontend access
- Role-based access control throughout

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## 🎯 Future Enhancements

- Real-time chat between students and faculty
- Advanced analytics and reporting
- Integration with external tools (GitHub, etc.)
- Mobile app version
- Automated plagiarism detection
- Multi-language support

---

Built with ❤️ for engineering education