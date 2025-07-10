export const spaceMonofont = require("@assets/fonts/SpaceMono-Regular.ttf");
export const bannerText = `To use this feature, please login or create an account. Click "login" in the header to get started.`;
export const bannerRegister = ``;
export const ONBOARDING_aCTIONS = [
  {
    id: 0,
    prompt: [
      "Hey, welcome to 961!",
      "I'm here to help you get things done. But first, I need to get to know you better - won't take long, I promise :)",
    ],
    //step: 1,
  },
  {
    id: 1,
    prompt: [{ text: "What's your real full name?", fontWeight: "extrabold" }],
    //step: 1,
    state: "name",
  },
  {
    id: 2,
    prompt: [{ text: "And your email?", fontWeight: "extrabold" }],
    //step: 2,
    state: "email",
  },
  {
    id: 3,
    prompt: [{ text: "When's your birthday? 🎂", fontWeight: "extrabold" }],
    //step: 3,
    state: "birthday",
  },
  {
    id: 4,
    prompt: [{ text: "Almost done! Are you male or female?", fontWeight: "extrabold" }],
    //step: 4,
    state: "gender",
  },
  {
    id: 5,
    prompt: [
      "Passwords aren't secure and we only allow real people on our app - no bots, no fake accounts, no hackers/scammers, and no foreign interference.",
      "Just like FaceID, you use your face to access your account on our app - cool, we know 😎",
    ],
    module: "registerPrompt",
    //step: 5,
  },
  {
    id: 6,
    prompt: ["Verified — you’re all set on security 🔐", "Welcome to the trusted circle, Joseph."],
    module: "createPassCode",
  },
  {
    id: 7,
    prompt: [
      "We're building a community of Lebanese that look out for one another ❤️ ",
      "We have a community blood donation system that’ll notify you if someone urgently needs the same blood type at a nearby hospital. Giving blood is completely optional, and you can always opt out.",
      { text: "What's your blood type?", fontWeight: "extrabold" },
    ],
    state: "bloodType",

    //step: 5,
  },
  {
    id: 8,
    prompt: [
      "Last step!",
      "Should I send you notifications when there’s a new event, a nearby deal, or an urgent blood donation request?",
      "(You can always change this later in settings.) 🔔",
    ],
    module: "notificationPrompt",
    //step: 5,
  },
];
