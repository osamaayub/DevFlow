import ROUTES from "@/shared/constants/route"

export const DEFAULT_EMPTY = {
  title: "No Data Found",
  message: "Looks like the database is taking a nap. Wake it up with some new entries.",
  button: {
    text: "Add Data",
    href: ROUTES.HOME
  }
}

export const DEFAULT_ERROR = {
  title: "Something Went Wrong",
  message: "Even our code can have a bad day. Give it another shot.",
  button: {
    text: "Retry Request",
    href: ROUTES.HOME
  }
}

export const EMPTY_QUESTION = {
  title: "Ahh, No Questions Yet!",
  message:
    "The question board is empty. Maybe it’s waiting for your brilliant question to get things rolling",
  button: {
    text: "Ask a Question",
    href: ROUTES.ASK_QUESTION
  }
}

export const EMPTY_TAGS = {
  title: "No Tags Found",
  message: "The tag cloud is empty. Add some keywords to make it rain.",
  button: {
    text: "Create Tag",
    href: ROUTES.TAGS
  }
}

export const EMPTY_COLLECTIONS = {
  title: "Collections Are Empty",
  message:
    "Looks like you haven’t created any collections yet. Start curating something extraordinary today",
  button: {
    text: "Save to Collection",
    href: ROUTES.COLLECTION
  }
}
export const EMPTY_ANSWERS = {
  title: "Answers Are Empty",
  message: "The answer board is empty. Make it rain with your brilliant answer."
}

export const EMPTY_USERS = {
  title: "No Users Found",
  message: "The community is quiet. Be the first to join and start the conversation!",
  button: {
    text: "Sign Up",
    href: ROUTES.SIGN_UP
  }
}

export const EMPTY_JOBS = {
  title: "No Jobs Found",
  message: "The job board is empty. Check back later for new opportunities!",
  button: {
    text: "Browse Jobs",
    href: ROUTES.JOBS
  }
}

export const EMPTY_APPLIED_JOBS = {
  title: "No Applications Yet",
  message: "You haven't applied to any jobs. Find a role you like and send your first application!",
  button: {
    text: "Browse Jobs",
    href: ROUTES.JOBS
  }
}

export const EMPTY_POSTED_JOBS = {
  title: "No Jobs Posted",
  message: "You haven't posted any jobs yet. Hiring? Post your first job and start receiving applications.",
  button: {
    text: "Post a Job",
    href: ROUTES.JOBS_NEW
  }
}

export const EMPTY_APPLICANTS = {
  title: "No Applicants Yet",
  message: "Nobody has applied to this job yet. Check back soon!",
  button: {
    text: "Back to My Jobs",
    href: `${ROUTES.MY_JOBS}?tab=posted`
  }
}

export const EMPTY_SAVED_JOBS = {
  title: "No Saved Jobs",
  message: "Save jobs you're interested in and they'll show up here so you can apply later.",
  button: {
    text: "Browse Jobs",
    href: ROUTES.JOBS
  }
}
