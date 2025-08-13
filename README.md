# Culture Mapping Tool

A comprehensive team culture assessment and analysis platform built with Next.js, TypeScript, and Tailwind CSS.

## 🎯 Overview

Culture Mapping Tool helps teams understand their personality dynamics and culture through OCEAN (Big Five) personality assessments. The platform provides insights, recommendations, and visualizations to improve team collaboration and effectiveness.

## ✨ Features

### Core Functionality
- **OCEAN Personality Assessment**: 20-question personality test with 7-point Likert scale
- **Team Management**: Create teams and invite members
- **Assessment Tracking**: Monitor completion status and progress
- **Culture Analysis**: Automated insights and recommendations
- **Visual Reports**: Radar charts and culture summaries

### Technical Features
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **Responsive Design**: Mobile-friendly interface
- **API-First**: RESTful API endpoints for all operations
- **Mock Database**: Ready-to-use development environment

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Eldon-buzink/culture_tool.git
   cd culture_tool
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
culture_tool/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── get-ocean-questions/  # Fetch assessment questions
│   │   └── submit-ocean-responses/ # Submit assessment responses
│   ├── assessment/               # Assessment pages
│   │   └── [uuid]/              # Dynamic assessment page
│   ├── components/               # UI Components
│   │   └── ui/                  # shadcn/ui components
│   ├── lib/                     # Utility libraries
│   │   ├── traits.ts           # OCEAN scoring logic
│   │   ├── culture.ts          # Culture analysis
│   │   ├── db.ts              # Database interface
│   │   └── utils.ts           # Utility functions
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── team/                        # Team management pages
│   ├── create.tsx              # Team creation
│   ├── invite.tsx              # Member invitation
│   └── dashboard.tsx           # Team dashboard
├── assessment/                  # Assessment pages (legacy)
├── components/                  # Reusable components (legacy)
├── api/                        # API endpoints (legacy)
├── lib/                        # Libraries (legacy)
└── package.json                # Dependencies and scripts
```

## 🎨 UI Components

The project uses shadcn/ui components for a consistent and modern design:

- **Button**: Various button styles and variants
- **Card**: Content containers with headers and footers
- **Input**: Form input fields
- **RadioGroup**: Radio button groups for assessments
- **Separator**: Visual dividers

## 🔧 API Endpoints

### Assessment
- `GET /api/get-ocean-questions` - Fetch OCEAN personality questions
- `POST /api/submit-ocean-responses` - Submit assessment responses

### Team Management
- `POST /api/createTeam` - Create a new team
- `POST /api/inviteMember` - Invite team members
- `POST /api/submitAssessment` - Submit team assessment
- `POST /api/generateReport` - Generate team reports

## 🧠 OCEAN Personality Framework

The assessment is based on the Big Five personality traits:

- **Openness**: Creativity, curiosity, and openness to new experiences
- **Conscientiousness**: Organization, reliability, and goal-directed behavior
- **Extraversion**: Social engagement, energy, and assertiveness
- **Agreeableness**: Cooperation, trust, and compassion
- **Neuroticism**: Emotional stability and stress response

## 🎯 Assessment Flow

1. **Team Creation**: Create a team and invite members
2. **Assessment**: Members complete the OCEAN personality test
3. **Analysis**: System calculates scores and generates insights
4. **Reporting**: View team culture analysis and recommendations
5. **Action**: Implement suggested improvements

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Key Technologies
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **Radix UI** - Accessible component primitives

## 📊 Mock Data

The application includes comprehensive mock data for development:
- 20 OCEAN personality questions
- Mock database with teams, users, and assessments
- Sample insights and recommendations

## 🔮 Future Enhancements

- [ ] Real database integration (PostgreSQL/MongoDB)
- [ ] User authentication and authorization
- [ ] Email notifications for invitations
- [ ] PDF report generation
- [ ] Team comparison analytics
- [ ] Historical assessment tracking
- [ ] Advanced visualization charts
- [ ] Mobile app development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Eldon Buzink**
- GitHub: [@Eldon-buzink](https://github.com/Eldon-buzink)

---

Built with ❤️ for better team collaboration and culture understanding.
