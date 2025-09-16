# 🚀 Freelancer Onboarding Integration with Supabase

## Overview

This document explains how the freelancer onboarding flow integrates with Supabase to create user profiles and store data progressively as users complete each step.

## 🏗️ Architecture

### Context-Based State Management
The freelancer onboarding flow uses React Context to maintain state across multiple pages, allowing data to accumulate as users progress through the steps.

```
OnboardingProvider
    ↓
Step 1: Personal Data → Context
    ↓
Step 2: Professional Profile → Context (accumulates)
    ↓
Final: Create Supabase Profile
```

## 📁 File Structure

```
lib/
├── hooks/
│   └── useOnboarding.ts          # Supabase integration logic
├── contexts/
│   └── OnboardingContext.tsx     # State management across steps
app/onboarding/
├── layout.tsx                     # Context provider wrapper
├── freelancer/
│   ├── personal-data/
│   │   └── page.tsx              # Step 1: Personal information
│   └── professional-profile/
│       └── page.tsx              # Step 2: Professional profile & completion
```

## 🔧 Core Components

### 1. OnboardingContext (`lib/contexts/OnboardingContext.tsx`)

**Purpose**: Manages state across all onboarding steps

**Key Features**:
- Stores freelancer data progressively
- Provides update and clear functions
- Maintains data integrity between page navigations

**Usage**:
```typescript
const { freelancerData, updateFreelancerData, clearFreelancerData } = useOnboardingContext();
```

### 2. useOnboarding Hook (`lib/hooks/useOnboarding.ts`)

**Purpose**: Handles Supabase operations and file uploads

**Key Features**:
- Creates user profiles in `profiles` table
- Creates freelancer profiles in `freelancer_profiles` table
- Uploads avatars to Supabase Storage
- Manages loading states and error handling

**Usage**:
```typescript
const { createFreelancerProfile, isLoading, error } = useOnboarding();
```

## 📊 Data Flow

### Step 1: Personal Data Collection
```typescript
// Required personal information
const personalData = {
  fullName,
  freelancerId: dni, // DNI as freelancer_id
  country,
  address
};

updateFreelancerData(personalData);
```

### Step 2: Professional Profile & Completion
```typescript
// Professional data with optional avatar
const professionalData = {
  position,
  bio: bio || undefined,
  avatarFile: avatarFile || undefined
};

// Final data assembly and Supabase creation
const completeData = {
  ...freelancerData,
  ...professionalData
};

const result = await createFreelancerProfile(completeData);
```

## 🗄️ Database Integration

### Profiles Table
```sql
INSERT INTO profiles (id, email, role)
VALUES (user.id, user.email, 'freelancer')
```

### Freelancer Profiles Table
```sql
INSERT INTO freelancer_profiles (
  id, full_name, freelancer_id, country, address,
  position, bio, avatar_url
) VALUES (...)
```

### Storage Integration
- **Bucket**: `avatars`
- **Path**: `{userId}/avatar.{extension}`
- **Policies**: Users can only upload their own avatars

## 🎯 User Experience Features

### Progressive Data Collection
- Data persists between steps
- Users can navigate back/forward
- No data loss on page refresh

### Error Handling
- Loading states during operations
- Clear error messages
- Graceful fallbacks

### File Upload
- Avatar upload to Supabase Storage
- Automatic URL generation
- Optional field (can be skipped)

## 🔒 Security Considerations

### Row Level Security (RLS)
- Users can only access their own profiles
- Storage policies restrict file access
- Authentication required for all operations

### Data Validation
- Required fields enforced
- File type restrictions for avatars
- DNI validation for freelancer identification

## 🚀 Usage Example

```typescript
// In any freelancer onboarding step
const { freelancerData, updateFreelancerData } = useOnboardingContext();

// Add data to context
updateFreelancerData({ fullName: 'Juan Pérez', country: 'Colombia' });

// Complete onboarding
const { createFreelancerProfile, isLoading } = useOnboarding();
const result = await createFreelancerProfile(freelancerData);

if (result.success) {
  // Redirect to home
  router.push('/');
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Context not available**
   - Ensure component is wrapped in `OnboardingProvider`
   - Check import path for `useOnboardingContext`

2. **Supabase errors**
   - Verify environment variables
   - Check RLS policies
   - Ensure user is authenticated

3. **File upload failures**
   - Check storage bucket exists
   - Verify file size limits
   - Confirm storage policies

### Debug Tips

- Use browser dev tools to inspect context state
- Check Supabase logs for database errors
- Verify authentication status
- Test with different file types/sizes

## 📈 Future Enhancements

- **Skills portfolio**: Add skills and experience sections
- **Data validation**: Client-side validation before submission
- **Progress saving**: Auto-save incomplete forms
- **Analytics**: Track onboarding completion rates
- **Multi-language**: Support for different languages

---

*This integration ensures a smooth, data-persistent freelancer onboarding experience while maintaining security and data integrity.*
