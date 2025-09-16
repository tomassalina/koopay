# 🚀 Onboarding Integration with Supabase

## Overview

This document explains how the contractor onboarding flow integrates with Supabase to create user profiles and store data progressively as users complete each step.

## 🏗️ Architecture

### Context-Based State Management
The onboarding flow uses React Context to maintain state across multiple pages, allowing data to accumulate as users progress through the steps.

```
OnboardingProvider
    ↓
Step 1: Contractor Type → Context
    ↓
Step 2: Personal Data → Context (accumulates)
    ↓
Step 3: Optional Data → Context (accumulates)
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
├── contractor/
│   ├── page.tsx                  # Step 1: Contractor type selection
│   ├── personal-data/
│   │   └── page.tsx              # Step 2: Personal information
│   └── optional-data/
│       └── page.tsx              # Step 3: Optional data & completion
```

## 🔧 Core Components

### 1. OnboardingContext (`lib/contexts/OnboardingContext.tsx`)

**Purpose**: Manages state across all onboarding steps

**Key Features**:
- Stores contractor data progressively
- Provides update and clear functions
- Maintains data integrity between page navigations

**Usage**:
```typescript
const { contractorData, updateContractorData, clearContractorData } = useOnboardingContext();
```

### 2. useOnboarding Hook (`lib/hooks/useOnboarding.ts`)

**Purpose**: Handles Supabase operations and file uploads

**Key Features**:
- Creates user profiles in `profiles` table
- Creates contractor profiles in `contractor_profiles` table
- Uploads logos to Supabase Storage
- Manages loading states and error handling

**Usage**:
```typescript
const { createContractorProfile, isLoading, error } = useOnboarding();
```

## 📊 Data Flow

### Step 1: Contractor Type Selection
```typescript
// Maps UI selection to database enum
const mappedType = contractorType === 'persona-juridica' ? 'individual' : 'company';
updateContractorData({ contractorType: mappedType });
```

### Step 2: Personal Data Collection
```typescript
// Different fields based on contractor type
const personalData = {
  country,
  address: legalAddress,
  businessId,
  website: website || undefined,
  ...(contractorData.contractorType === 'individual' ? {
    fullName: companyName,
    individualId: businessId
  } : {
    legalName: companyName,
    displayName: companyName,
    businessId,
    website: website || undefined
  })
};
```

### Step 3: Optional Data & Completion
```typescript
// Final data assembly and Supabase creation
const completeData = {
  ...contractorData,
  description: description || undefined,
  logoFile: logoFile || undefined
};

const result = await createContractorProfile(completeData);
```

## 🗄️ Database Integration

### Profiles Table
```sql
INSERT INTO profiles (id, email, role)
VALUES (user.id, user.email, 'contractor')
```

### Contractor Profiles Table
```sql
INSERT INTO contractor_profiles (
  id, contractor_type, country, address, logo_url,
  -- Individual fields
  full_name, individual_id,
  -- OR Company fields  
  legal_name, display_name, business_id, website_url
) VALUES (...)
```

### Storage Integration
- **Bucket**: `logos`
- **Path**: `{userId}/logo.{extension}`
- **Policies**: Users can only upload their own logos

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
- Logo upload to Supabase Storage
- Automatic URL generation
- Optional field (can be skipped)

## 🔒 Security Considerations

### Row Level Security (RLS)
- Users can only access their own profiles
- Storage policies restrict file access
- Authentication required for all operations

### Data Validation
- Required fields enforced
- Type-specific field validation
- File type restrictions

## 🚀 Usage Example

```typescript
// In any onboarding step
const { contractorData, updateContractorData } = useOnboardingContext();

// Add data to context
updateContractorData({ country: 'Colombia' });

// Complete onboarding
const { createContractorProfile, isLoading } = useOnboarding();
const result = await createContractorProfile(contractorData);

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

- **Freelancer onboarding**: Similar flow for freelancer profiles
- **Data validation**: Client-side validation before submission
- **Progress saving**: Auto-save incomplete forms
- **Analytics**: Track onboarding completion rates
- **Multi-language**: Support for different languages

---

*This integration ensures a smooth, data-persistent onboarding experience while maintaining security and data integrity.*
