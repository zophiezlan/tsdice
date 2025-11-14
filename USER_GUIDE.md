# 🎨 tsDice User Guide: From Beginner to Power User

> **Welcome!** This guide will take you from your first click to mastering tsDice's hidden depths.

---

## 📚 Table of Contents

1. [Your First 5 Minutes](#your-first-5-minutes)
2. [Understanding the Interface](#understanding-the-interface)
3. [The Chaos Level Explained](#the-chaos-level-explained)
4. [Shuffle Strategies](#shuffle-strategies)
5. [Toggle Powers](#toggle-powers)
6. [Keyboard Ninja Mode](#keyboard-ninja-mode)
7. [Sharing Your Creations](#sharing-your-creations)
8. [Creative Recipes](#creative-recipes)
9. [Troubleshooting](#troubleshooting)
10. [Pro Tips & Tricks](#pro-tips--tricks)

---

## Your First 5 Minutes

### Step 1: Open tsDice

Visit [zophiezlan.github.io/tsdice](https://zophiezlan.github.io/tsdice) and watch the particles dance! 🎉

### Step 2: Open the Menu

Click the **⚙️ settings icon** in the bottom-left corner. The control panel slides out like magic.

**Note**: The menu automatically hides after 10 seconds of inactivity. Move your mouse over the menu or interact with it to keep it open!

### Step 3: Your First Shuffle

Click the **🎲 Shuffle All** button. Boom! A completely new particle scene. Do it again. And again. Each one is unique!

### Step 4: Explore Granular Control

Try these buttons one by one:

- 👁️ **Shuffle Appearance** — Only the colors and shapes change
- 🧭 **Shuffle Movement** — Only the motion changes
- 🖱️ **Shuffle Interaction** — Only the mouse effects change
- ✨ **Shuffle Special FX** — Only advanced effects toggle

Notice how each shuffle preserves the other aspects? That's **granular randomization**!

### Step 5: Play with Toggles

- Click **🌙 Theme** to switch between dark and light mode
- Click **⬇️ Gravity** to watch particles fall
- Click **🔲 Walls** to make particles bounce at the edges
- Click **🖱️ Cursor** to turn your mouse into a particle emitter!

**Congratulations!** You now know the basics. Let's go deeper...

---

## Understanding the Interface

### The Control Panel

```
┌─────────────────────────────────────────────────────┐
│  🎲  👁️  🧭  🖱️  ✨   ← Shuffle Buttons             │
│                                                      │
│  ━━━━━━━━━━  5  ← Chaos Level Slider               │
│                                                      │
│  ↶  ↷  🔄  ⏸️  🌙   ← History & Playback           │
│                                                      │
│  ⬇️  🔲  🖱️  🔗  ℹ️   ← Toggles & Utilities        │
└─────────────────────────────────────────────────────┘
```

### Button Categories

#### Shuffle Section

| Button | Name                | What It Does              | When to Use                      |
| ------ | ------------------- | ------------------------- | -------------------------------- |
| 🎲     | Shuffle All         | Complete randomization    | Starting fresh, exploring widely |
| 👁️     | Shuffle Appearance  | Colors, shapes, sizes     | Fine-tuning the visuals          |
| 🧭     | Shuffle Movement    | Speed, direction, trails  | Adjusting the animation feel     |
| 🖱️     | Shuffle Interaction | Mouse hover/click effects | Changing interactivity           |
| ✨     | Shuffle Special FX  | Links, rotation, wobble   | Adding/removing complexity       |

#### History Section

| Button | Name    | Shortcut | Purpose                         |
| ------ | ------- | -------- | ------------------------------- |
| ↶      | Back    | Alt+Z    | Undo last shuffle (infinite)    |
| ↷      | Forward | Alt+Y    | Redo after undo                 |
| 🔄     | Refresh | Alt+R    | Restart animation (same config) |
| ⏸️     | Pause   | Space    | Freeze/resume animation         |
| 🌙     | Theme   | Alt+T    | Toggle dark/light mode          |

#### Toggle Section

| Button | Name    | Shortcut | Effect                    |
| ------ | ------- | -------- | ------------------------- |
| ⬇️     | Gravity | Alt+G    | Pull particles downward   |
| 🔲     | Walls   | Alt+W    | Bounce particles at edges |
| 🖱️     | Cursor  | Alt+C    | Emit particles from mouse |
| 🔗     | Share   | Alt+S    | Copy shareable URL        |
| ℹ️     | Info    | Alt+?    | Show help modal with tabs |

**Note**: The Info modal has three tabs (Controls, Shortcuts, Guide) that you can navigate with arrow keys. It remembers your last viewed tab!

### Visual Feedback

#### Button States

- **Normal**: Semi-transparent glass effect
- **Hover**: Brightens + scales up (1.1x)
- **Active**: Purple background (toggles only)
- **Disabled**: Grayed out + no pointer events

#### Shuffle Effects

When you shuffle, the particle canvas briefly brightens (1.3x brightness for 150ms) to provide instant visual confirmation of the action.

#### Toast Notifications

Toast notifications appear at the bottom center of the screen and automatically disappear after 3 seconds. They provide visual feedback for your actions:

**Shuffle Actions:**

- "Undid [Type] shuffle" (e.g., "Undid Appearance shuffle")
- "Redid [Type] shuffle" (e.g., "Redid Movement shuffle")

**Theme & Display:**

- "Dark theme enabled" / "Light theme enabled"
- "Animation paused" / "Animation resumed"
- "Scene refreshed!"

**Toggle Controls:**

- "Gravity enabled" / "Gravity disabled"
- "Walls enabled" / "Walls disabled"
- "Cursor particle enabled" / "Cursor particle disabled"

**Chaos Level:**

- "Chaos level set to [1-10]" (e.g., "Chaos level set to 8")

**Sharing:**

- "⏳ Creating shareable link..."
- "✓ Link copied to clipboard"
- "✓ Short link copied! [emoji-string]"
- "Current page URL copied as fallback"
- "❌ Failed to create share link"

**Special Features:**

- "🎉 Party Mode Activated! 🎊" (Konami code easter egg)

**Error States:**

- "Invalid shared configuration link"
- "No particle animation loaded"
- "Config error - restored previous state"
- "Failed to load particles - please refresh"
- "Failed to load particle configuration"

**Accessibility:**

- "Animation paused due to reduced motion preference."

#### Screen Reader Announcements

tsDice uses ARIA live regions to announce important state changes to screen readers. These announcements complement the visual toast notifications:

**Shuffle & History:**

- "New scene generated."
- "Action undone."
- "Action redone."
- "Undid [Type] shuffle"
- "Redid [Type] shuffle"

**Toggle States:**

- "Gravity enabled" / "Gravity disabled"
- "Walls enabled" / "Walls disabled"
- "Cursor enabled" / "Cursor disabled"
- "Theme enabled" / "Theme disabled"

**Playback Controls:**

- "Animation paused" / "Animation resumed"
- "Scene refreshed"

**Chaos Level:**

- "Chaos level [1-10]" (announced during slider movement)
- "Chaos level set to [1-10]" (announced on release)

**Sharing:**

- "Creating shareable link"
- "Short emoji link copied to clipboard"
- "Full configuration link copied to clipboard"
- "Current page URL copied as fallback"
- "Error creating share link"

**Special Features:**

- "Party mode activated with Konami code"

**Error & Status Messages:**

- "Invalid shared configuration link"
- "No particle animation loaded"
- "Config error - restored previous state"
- "Failed to load particles - please refresh"
- "Failed to load particle configuration"
- "Animation paused due to reduced motion preference."

---

## The Chaos Level Explained

The **Chaos Slider** (1-10) is tsDice's secret weapon. It doesn't just control randomness — it controls **complexity**.

### What Changes with Chaos Level?

| Chaos Level | Particle Count | Speed Range       | Effect Probability | Vibe             |
| ----------- | -------------- | ----------------- | ------------------ | ---------------- |
| 1-2         | 20-60          | Slow (0.5-2x)     | 10-20%             | Zen, minimalist  |
| 3-4         | 60-100         | Gentle (1.5-4x)   | 30-40%             | Calm exploration |
| 5-6         | 100-140        | Moderate (2.5-7x) | 50-60%             | Balanced energy  |
| 7-8         | 140-180        | Fast (3.5-10x)    | 70-80%             | Dynamic chaos    |
| 9-10        | 180-220        | Extreme (4.5-13x) | 90-100%            | Maximum madness  |

### How It Works Behind the Scenes

```javascript
// Particle count formula
particleCount = 20 + chaosLevel * 20;

// Chaos 1: 20 + (1 * 20) = 40 particles
// Chaos 5: 20 + (5 * 20) = 120 particles
// Chaos 10: 20 + (10 * 20) = 220 particles

// Speed multiplier
speed = getRandomInRange(chaosLevel * 0.5, chaosLevel * 2);

// Effect probability scaling
effectChance = baseProbability * (chaosLevel / 5);

// Example: Wobble effect (base 50%)
// Chaos 1: 50% * (1/5) = 10% chance
// Chaos 5: 50% * (5/5) = 50% chance
// Chaos 10: 50% * (10/5) = 100% chance
```

### Recommended Chaos Levels by Use Case

- **Wallpaper**: 2-4 (subtle, won't distract)
- **Presentation background**: 3-5 (visible but not overwhelming)
- **Creative exploration**: 7-9 (discover wild combinations)
- **Party mode**: 10 (maximum everything)
- **Meditation**: 1-2 (peaceful, slow, minimal)

### Chaos + Toggles = Super Powers

Try these combinations:

- **Chaos 10 + Gravity + Walls** = Particle pinball!
- **Chaos 1 + Cursor Particle** = Elegant painting tool
- **Chaos 8 + Dark Theme** = Cosmic starfield
- **Chaos 5 + Light Theme** = Clean, professional

---

## Shuffle Strategies

### Strategy 1: The Explorer

**Goal**: Discover something unexpected

1. Set Chaos to 7
2. Click **Shuffle All** 10 times rapidly
3. When something catches your eye, click **Pause**
4. Fine-tune with category shuffles

### Strategy 2: The Sculptor

**Goal**: Refine a specific aesthetic

1. Start with **Shuffle All** until you like the movement
2. Lock in movement, shuffle **Appearance** only
3. Found good colors? Shuffle **Interaction** only
4. Polish with **Special FX** shuffle

### Strategy 3: The Archaeologist

**Goal**: Recover a past discovery

1. Shuffle freely without worry
2. Went too far? Click **Back** (↶) repeatedly
3. Use **Forward** (↷) to re-explore alternatives
4. Infinite history means you're safe!

### Strategy 4: The Curator

**Goal**: Create a collection

1. Shuffle until you find a keeper
2. Click **Share** to save the URL
3. Paste into a note/doc
4. Repeat to build a library
5. Later, open any URL to restore that exact scene

### Strategy 5: The Mad Scientist

**Goal**: Push boundaries

1. Max out Chaos at 10
2. Enable all toggles (Gravity, Walls, Cursor)
3. Shuffle Special FX until something breaks beautifully
4. Try the Konami code (↑ ↑ ↓ ↓ ← → ← → B A) for secret party mode!

---

## Toggle Powers

### Gravity Toggle ⬇️

**What it does**: Adds downward acceleration to all particles

**Behaviors**:

- Particles fall like rain, snow, or confetti
- Speed increases as they fall
- Combine with Walls for perpetual motion
- Without Walls, particles disappear off-screen

**Creative uses**:

- **Rain effect**: Chaos 3, small circles, gravity on
- **Falling stars**: Chaos 5, star shapes, gravity on
- **Snowfall**: Chaos 2, white circles, slow speed

### Walls Toggle 🔲

**What it does**: Makes particles bounce off screen edges

**Technical detail**: Overrides the particle's `outMode` setting from "out" to "bounce"

**Behaviors**:

- Particles never disappear
- Creates contained, bubble-like movement
- Essential for long-running displays

**Creative uses**:

- **Bouncing balls**: Chaos 6, circles, walls on
- **Particle billiards**: Chaos 8, collisions on, walls on
- **Perpetual motion**: Any chaos level, walls on

### Cursor Particle 🖱️

**What it does**: Turns your mouse into a particle emitter

**Important**: Temporarily disables hover and click interactions

**Behaviors**:

- Moving mouse creates a trail of particles
- Stationary mouse = no new particles
- Created particles follow current config settings

**Creative uses**:

- **Drawing tool**: Chaos 2, cursor on, drag to paint
- **Signature creator**: Write your name with particles
- **Interactive art**: Let audience move mouse around

**Tip**: Try cursor mode with different particle shapes:

- Hearts = love message
- Stars = magical sparkles
- Emojis = fun signatures

---

## Keyboard Ninja Mode

Once you memorize these shortcuts, you'll 10x your workflow:

### Essential Trio

```
Alt + A → Shuffle All
Space   → Pause/Play
Alt + Z → Undo
```

These three cover 80% of usage!

### Category Shuffles

```
Alt + P → Shuffle Appearance (P for "Pretty")
Alt + V → Shuffle Movement (V for "Velocity")
Alt + I → Shuffle Interaction (I for "Interactive")
Alt + F → Shuffle Special FX (F for "FX")
```

### Toggles

```
Alt + G → Gravity
Alt + W → Walls
Alt + C → Cursor particle
Alt + T → Theme (dark/light)
```

### Navigation

```
Alt + Z → Undo (like Ctrl+Z but for shuffles)
Alt + Y → Redo (like Ctrl+Y)
Alt + M → Open/Close Menu
```

### Utilities

```
Alt + S → Share (create URL)
Alt + R → Refresh (restart animation)
Alt + ? → Show help modal
Escape  → Close any modal
```

### Pro Workflows

#### Rapid Exploration Workflow

```
Alt+A Alt+A Alt+A Alt+A    (Shuffle 4 times)
Space                       (Pause on something good)
Alt+Z                       (Go back one)
Alt+P                       (Tweak appearance)
Alt+S                       (Share it!)
```

#### Fine-Tuning Workflow

```
Alt+A                       (Start fresh)
Alt+V Alt+V Alt+V           (Shuffle movement until nice)
Alt+P Alt+P                 (Shuffle appearance twice)
Alt+F                       (Add some FX)
Alt+W                       (Enable walls)
Alt+S                       (Share final result)
```

#### Recovery Workflow

```
Alt+A Alt+A Alt+A           (Shuffle rapidly)
(Oops, went too far!)
Alt+Z Alt+Z Alt+Z           (Undo 3 times)
Alt+Y                       (Actually, redo 1)
Perfect!
```

---

## Sharing Your Creations

### How Sharing Works

When you click **Share**, tsDice:

1. Shows "⏳ Creating shareable link..." toast notification
2. Captures your entire configuration + UI state
3. Compresses it using LZMA algorithm (lz-string)
4. Encodes as URL-safe Base64
5. Attempts to shorten via emoji API (share.ket.horse)
6. Copies to clipboard
7. Shows success toast with either:
   - "✓ Short link copied! [emoji-string]" (if shortening succeeded)
   - "✓ Link copied to clipboard" (if using full URL)
   - "Current page URL copied as fallback" (if an error occurred)

### Understanding Share URLs

#### Full URL (Unshortened)

```
https://zophiezlan.github.io/tsdice/#config=N4IgdghgtgpiBc...
                                 ↑
                          Compressed config data
```

**Length**: 500-2000 characters (depends on complexity)

#### Short URL (Emoji)

```
https://share.ket.horse/🐎🦄🌀✨🎉🪐👽🛸
                         ↑
                    8 random emojis
```

**Length**: ~40 characters

**Note**: Short URLs redirect to the full URL, so both work identically!

### Sharing Best Practices

#### For Social Media

- **Twitter/X**: Short URL fits perfectly
- **Discord**: Either format works
- **Reddit**: Use markdown: `[Check out my particle scene!](URL)`

#### For Work

- **Slack**: Short URL looks cleaner
- **Email**: Full URL is more professional (no emoji confusion)
- **Presentation**: Use full URL in slide notes

#### For Personal Use

- **Bookmark**: Full URL in browser bookmarks
- **Note-taking apps**: Either format
- **Portfolio**: Embed full URL in HTML

### What Gets Saved in URLs?

✅ **Included**:

- Particle appearance (colors, shapes, sizes)
- Movement settings (speed, direction, trails)
- Interaction modes (hover, click effects)
- Special FX (links, rotation, wobble)
- Chaos level
- Theme (dark/light)
- Toggle states (gravity, walls, cursor)

❌ **Not Included**:

- Animation playhead position
- Undo/redo history
- Modal open/closed state

### Sharing Etiquette

- **Credit tsParticles**: "Made with tsDice (tsParticles)"
- **Describe your creation**: "Cosmic starfield at chaos 8"
- **Share your recipe**: "Chaos 5 + gravity + walls + star shapes"

---

## Creative Recipes

### Recipe 1: Zen Garden

```
1. Set Chaos to 2
2. Shuffle All until you get circles
3. Enable Light Theme
4. Shuffle Appearance until pastel colors
5. Disable all Special FX (shuffle until links=false)
6. Set speed to slow (shuffle Movement)
```

**Use case**: Meditation background, calm presentations

### Recipe 2: Matrix Rain

```
1. Set Chaos to 6
2. Dark Theme
3. Shuffle until green particles
4. Shuffle Movement until "down" direction
5. Disable Walls for perpetual rain
6. Shuffle until you get line shapes (or characters)
```

**Use case**: Coding streams, hacker aesthetic

### Recipe 3: Confetti Celebration

```
1. Set Chaos to 10
2. Shuffle All
3. Enable Gravity
4. Enable Walls
5. Shuffle until multi-color and diverse shapes
6. Click Refresh repeatedly to restart the fall
```

**Use case**: Party backgrounds, celebration announcements

### Recipe 4: Constellation Map

```
1. Set Chaos to 4
2. Dark Theme
3. Shuffle until star shapes
4. Shuffle Special FX until links enabled
5. Disable gravity and walls
6. Slow movement speed
```

**Use case**: Night sky simulation, astronomy content

### Recipe 5: Paint Splatter

```
1. Set Chaos to 7
2. Enable Cursor Particle
3. Shuffle until large, colorful circles
4. Enable Gravity
5. Move mouse wildly across screen
6. Disable Cursor after painting
```

**Use case**: Abstract art, interactive installations

### Recipe 6: Plasma Field

```
1. Set Chaos to 8
2. Shuffle until small particles
3. Enable wobble effect (shuffle FX)
4. Enable links (shuffle FX until appears)
5. Enable rotation (shuffle FX)
6. Disable straight movement
```

**Use case**: Sci-fi backgrounds, energy fields

### Recipe 7: Snowglobe

```
1. Set Chaos to 3
2. Light Theme
3. Shuffle until white circles
4. Enable Gravity
5. Enable Walls
6. Shuffle Movement until very slow
```

**Use case**: Winter themes, holiday cards

---

## Troubleshooting

### Problem: Particles disappeared

**Causes**:

- They left the screen (outMode = "out")
- Life/destroy effect enabled
- Chaos too low + small particle count

**Solutions**:

1. Enable **Walls** toggle
2. Click **Refresh** to restart
3. Shuffle Special FX to disable life/destroy
4. Increase Chaos level

### Problem: Too laggy/slow performance

**Causes**:

- Chaos level too high
- Too many complex effects
- Older device

**Solutions**:

1. Lower Chaos to 3-5
2. Disable Special FX (links especially)
3. Shuffle FX until collisions disabled
4. Enable Light Theme (sometimes helps)
5. Close other browser tabs

### Problem: Share link doesn't work

**Causes**:

- URL got truncated (copied partially)
- Emoji URL expired (rare)
- Browser cache issue

**Solutions**:

1. Copy URL again (might have been cut off)
2. Try opening in incognito/private mode
3. Use full URL instead of short URL
4. Clear browser cache

### Problem: Can't undo anymore

**Cause**: This shouldn't happen anymore - history is now infinite!

**Solution**: If you do encounter this issue, it may be a browser memory limitation:

- Try refreshing the page
- Share important configs regularly as a backup

### Problem: Modal won't close

**Solutions**:

1. Press **Escape** key
2. Click outside the modal (on dark overlay)
3. Click the close button again
4. Refresh the page

### Problem: Keyboard shortcuts not working

**Causes**:

- Typing in search bar / input field
- Modal is open (some shortcuts disabled)
- Browser extension conflict

**Solutions**:

1. Click on page background first
2. Close any open modals
3. Try in incognito mode
4. Check browser console for errors

---

## Pro Tips & Tricks

### Discovery Tips

1. **The Rule of 3**: Shuffle 3 times before judging. First shuffle might not impress, but the third often surprises.

2. **Chaos Hopping**: Jump between chaos 2 → 8 → 2. Extremes reveal possibilities the middle misses.

3. **Theme Flip Test**: Found something good? Toggle theme. Sometimes it's even better in the opposite mode!

4. **Category Isolation**: Love the movement but hate the colors? Shuffle Appearance ONLY. Don't start over.

5. **The Pause Reveal**: Shuffle rapidly with eyes closed, pause randomly, open eyes. Your brain will find patterns!

### Workflow Tips

1. **Start High, End Low**: Begin at Chaos 8 for wild ideas, then lower to 4 to refine.

2. **Bookmark Your Go-Tos**: Create a "tsDice Library" bookmark folder with 10-20 favorite configs.

3. **Name Your Shares**: When pasting URLs in notes, add descriptions: `🌌 Cosmic scene - chaos 7`

4. **Use Refresh, Not Shuffle**: Found the perfect config but want to restart the animation? Refresh, don't shuffle!

5. **Undo Is Your Friend**: Never fear experimentation. You can undo as far back as you want!

### Performance Tips

1. **Mobile Optimization**: On phones, keep chaos ≤ 6 for smooth 60fps

2. **Battery Saver**: Pause the animation when not actively watching (Space bar)

3. **Fullscreen Focus**: Press F11 (or fullscreen button) for distraction-free creative mode

4. **Theme for Speed**: Light theme sometimes renders faster than dark (depends on colors)

### Presentation Tips

1. **Pre-Shuffle Before Demo**: Have 3-4 scenes ready via shared URLs before your presentation

2. **Audience Interaction**: Enable Cursor Particle and let audience members "paint" with their mouse

3. **Live Customization**: Ask audience "calm or chaos?" then adjust slider in real-time

4. **Background Loop**: Set Chaos 3, enable Walls, let it run infinitely during talks

### Creative Tips

1. **Match Your Brand**: Shuffle until colors match your logo, then save that URL permanently

2. **Seasonal Themes**:
   - Spring: Green/pink, chaos 4, gravity off
   - Summer: Bright colors, chaos 7
   - Fall: Orange/brown, gravity on
   - Winter: White, chaos 2, gravity on

3. **Emotion Mapping**:
   - Joy: High chaos, warm colors
   - Calm: Low chaos, cool colors
   - Mystery: Dark theme, wobble FX
   - Energy: Max chaos, collision FX

4. **Desktop Wallpaper**: Use the [desktop branch](https://github.com/zophiezlan/tsdice/tree/desktop) + Lively Wallpaper for animated backgrounds

---

## Advanced Techniques

### The Differential Shuffle

Create subtle variations of a good config:

1. Find a config you love (let's say Config A)
2. Click **Share** and save URL as "Original"
3. Shuffle **only Appearance** → Save as "Color Variant 1"
4. Undo back to Config A
5. Shuffle **only Movement** → Save as "Motion Variant 1"
6. Undo back to Config A
7. Shuffle **only FX** → Save as "FX Variant 1"

Now you have 4 related scenes!

### The Chaos Sweep

Find the sweet spot for any config:

1. Shuffle All at Chaos 5
2. Test at Chaos 1 → Too calm?
3. Test at Chaos 10 → Too chaotic?
4. Binary search: Try 5 → 7 → 6 → Find perfect level

### The Toggle Dance

Create dynamic scenes by rapidly toggling:

1. Set up a good base config
2. Enable Gravity → Watch particles fall
3. Disable Gravity → Watch particles float
4. Enable Walls → Particles contained
5. Disable Walls → Particles free

Cycle these every 10 seconds for an evolving scene!

### The Emoji Signature

Create a personal particle style:

1. Find your favorite emoji shape (character type)
2. Always use the same chaos level (your "signature chaos")
3. Pick a color palette you love
4. Save multiple URLs with this style

People will recognize your "particle aesthetic"!

---

## Accessibility Features

tsDice is built with **accessibility first**:

### For Screen Reader Users

- All buttons have ARIA labels
- Live regions announce state changes
- Keyboard shortcuts announced in tooltips
- Modal focus management

### For Keyboard Users

- Full keyboard navigation (Tab, Enter, Arrow keys)
- No mouse required!
- Visible focus indicators
- Modal focus trapping

### For Motion-Sensitive Users

- Automatic pause for `prefers-reduced-motion`
- Manual pause available (Space bar)
- Reduced animation mode supported

### For Low Vision Users

- High contrast mode support
- Scalable UI (respects browser zoom)
- Large touch targets (44x44px minimum)

---

## FAQ

**Q: Can I use tsDice creations commercially?**  
A: Yes! MIT license. Credit appreciated but not required.

**Q: How long do share URLs last?**  
A: Forever! Full URLs work as long as tsDice exists. Short URLs last 1+ year.

**Q: Can I download the particle animations?**  
A: Not directly, but you can use OBS or screen recording software.

**Q: Does tsDice work offline?**  
A: Not currently (requires CDN for tsParticles), but could be modified.

**Q: Can I add my own particle shapes?**  
A: Not in the UI, but you can fork the code and extend `configGenerator.js`.

**Q: Why is my chaos 10 config slow?**  
A: 220+ particles is demanding. Try chaos 7-8 or disable complex effects.

**Q: Can I embed tsDice in my website?**  
A: Yes! Use an iframe pointing to a share URL.

**Q: What's the desktop wallpaper version?**  
A: Check the [desktop branch](https://github.com/zophiezlan/tsdice/tree/desktop) for Lively Wallpaper integration.

---

## Community Showcase

Share your creations!

- **GitHub Discussions**: Post your favorite configs
- **Twitter/X**: Use #tsDice hashtag
- **Reddit**: Share in r/generative or r/creativecoding

---

**Ready to create magic? [Launch tsDice →](https://zophiezlan.github.io/tsdice/)**

_Happy shuffling!_ 🎲✨🎨
