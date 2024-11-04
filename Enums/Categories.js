const AppCategory = {
    WORK: "Work",
    DEV: "Development",
    ENTERTAINMENT: "Entertainment",
    SOCIAL_MEDIA: "Social Media",
    COMMUNICATION: "Communication"
};

// Define applications with freeze to make it immutable
const Apps = Object.freeze({
    CODE_EDITOR: ["Visual Studio Code"],
    TEXT_EDITOR: ["Notepad"],
    BROWSERS: ["Microsoft Edge", "Google Chrome"],
    DESIGN_TOOLS: ["Figma"],
    MUSIC_APPS: ["Spotify"],
    SOCIAL_APPS: ["Twitter"],
    COMMUNICATION_APPS: ["Microsoft Teams"]
});


const AppCategories = {
    [Apps.CODE_EDITOR]: AppCategory.DEV,
    [Apps.BROWSERS]: AppCategory.DEV,
    [Apps.DESIGN_TOOLS]: AppCategory.WORK,
    [Apps.TEXT_EDITOR]: AppCategory.WORK,
    [Apps.MUSIC_APPS]: AppCategory.ENTERTAINMENT,
    [Apps.SOCIAL_APPS]: AppCategory.SOCIAL_MEDIA,
    [Apps.COMMUNICATION_APPS]: AppCategory.COMMUNICATION,
};

module.exports={AppCategories}