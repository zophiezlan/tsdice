# tsDice → my.ket.horse API Integration Documentation

**Version:** 2.0
**Last Updated:** 2025-11-30
**API Endpoint:** `https://my.ket.horse/api/tsdice/share`

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Request Format](#request-format)
3. [Response Format](#response-format)
4. [Config Data Structure](#config-data-structure)
5. [Smart Emoji Selection Logic](#smart-emoji-selection-logic)
6. [Implementation Guide](#implementation-guide)
7. [Testing & Validation](#testing--validation)
8. [Error Handling](#error-handling)

---

## 🎯 Overview

tsDice sends comprehensive particle configuration data to `my.ket.horse/api/tsdice/share` to enable intelligent emoji URL generation. The API analyzes the particle settings and selects contextually relevant emojis.

**Key Features:**
- ✅ Comprehensive particle metadata (25+ properties)
- ✅ Theme-aware (dark/light mode)
- ✅ Effect-based emoji selection
- ✅ Shape and color detection
- ✅ Interaction mode analysis

---

## 📤 Request Format

### HTTP Request

```http
POST /api/tsdice/share HTTP/1.1
Host: my.ket.horse
Content-Type: application/x-www-form-urlencoded
Accept: application/json

url=https%3A%2F%2Fket.horse%2F%23config%3D...&config=%7B...%7D
```

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | ✅ Yes | Full tsDice URL with compressed config |
| `config` | JSON string | ✅ Yes | Particle configuration metadata |
| `password` | string | ❌ No | Password protect the link |
| `max-clicks` | integer | ❌ No | Maximum clicks before expiration |

### JavaScript Example

```javascript
const response = await fetch("https://my.ket.horse/api/tsdice/share", {
  method: "POST",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: new URLSearchParams({
    url: longUrl,
    config: JSON.stringify(configData),
  }),
});
```

---

## 📥 Response Format

### Success Response (200 OK)

```json
{
  "short_url": "https://my.ket.horse/🌈✨🎨",
  "stats_url": "https://my.ket.horse/stats/🌈✨🎨",
  "emojis": "🌈✨🎨",
  "domain": "my.ket.horse",
  "original_url": "https://ket.horse/#config=...",
  "api_version": "1.0-tsdice",
  "authenticated": false
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `short_url` | string | Complete short URL with emojis |
| `stats_url` | string | URL to view click statistics |
| `emojis` | string | The emoji alias (3 emojis) |
| `domain` | string | Short domain used |
| `original_url` | string | Original long URL |
| `api_version` | string | API version identifier |
| `authenticated` | boolean | Whether API key was used |

### Error Response (400/403/500)

```json
{
  "UrlError": "Invalid URL",
  "hint": "URL must have valid protocol and follow RFC patterns",
  "example": "https://ket.horse?config=..."
}
```

---

## 🎨 Config Data Structure

tsDice sends a comprehensive JSON object with all particle configuration details:

### Complete Structure

```typescript
interface TsDiceConfig {
  // UI State
  theme: "dark" | "light";
  gravity: boolean;
  walls: boolean;
  cursorParticle: boolean;
  chaosLevel: number; // 1-10

  // Particle Properties
  particleCount: number;
  shape: "circle" | "square" | "triangle" | "polygon" | "star" | "character" | "edge" | "image";
  color: string; // Hex color or "random"
  hasStroke: boolean;

  // Movement & Animation
  speed: number;
  direction: "none" | "top" | "top-right" | "right" | "bottom-right" | "bottom" | "bottom-left" | "left" | "top-left";
  trail: boolean;
  attract: boolean;

  // Special Effects
  links: boolean;
  linksTriangles: boolean;
  collisions: boolean;
  collisionMode: "bounce" | "destroy" | "none";
  wobble: boolean;
  rotate: boolean;
  twinkle: boolean;

  // Interaction Modes
  hoverMode: "grab" | "repulse" | "bubble" | "connect" | "slow" | "remove" | "trail" | "attract" | "parallax";
  clickMode: "push" | "remove" | "bubble" | "repulse" | "attract" | "absorb";

  // Character/Emoji particles
  isCharacter: boolean;
  characterValue?: string; // The emoji used as particle

  // Polygon sides (for polygon shapes)
  polygonSides?: number; // 3-12
}
```

### Example Config Data

```json
{
  "theme": "dark",
  "gravity": true,
  "walls": false,
  "cursorParticle": false,
  "chaosLevel": 7,
  "particleCount": 140,
  "shape": "star",
  "color": "random",
  "hasStroke": false,
  "speed": 14,
  "direction": "bottom",
  "trail": true,
  "attract": false,
  "links": false,
  "linksTriangles": false,
  "collisions": true,
  "collisionMode": "bounce",
  "wobble": true,
  "rotate": true,
  "twinkle": true,
  "hoverMode": "bubble",
  "clickMode": "push",
  "isCharacter": false
}
```

---

## 🧠 Smart Emoji Selection Logic

The API should analyze the config data and select 3 emojis that represent the particle configuration.

### Priority-Based Selection Matrix

#### 1. Theme Detection (Priority: High)

```python
if config.get("theme") == "dark":
    emojis.append("🌙")
elif config.get("theme") == "light":
    emojis.append("☀️")
```

#### 2. Gravity & Physics (Priority: High)

```python
if config.get("gravity"):
    emojis.append("🌍")

if config.get("walls"):
    emojis.append("🧱")
```

#### 3. Shape Detection (Priority: Medium)

```python
shape_emojis = {
    "star": "⭐",
    "circle": "⚪",
    "square": "🟦",
    "triangle": "🔺",
    "polygon": "🔷",
    "character": config.get("characterValue", "🎭"),
}

if config.get("shape") in shape_emojis:
    emojis.append(shape_emojis[config.get("shape")])
```

#### 4. Color Detection (Priority: Medium)

```python
# For hex colors
color = config.get("color", "")

if color == "random":
    emojis.append("🌈")
elif "#ff" in color.lower() or "red" in color:
    emojis.append("❤️")
elif "#00" in color.lower() or "blue" in color:
    emojis.append("💙")
elif "green" in color:
    emojis.append("💚")
elif "purple" in color or "violet" in color:
    emojis.append("💜")
elif "yellow" in color or "gold" in color:
    emojis.append("💛")
```

#### 5. Special Effects (Priority: High)

```python
if config.get("twinkle"):
    emojis.append("✨")

if config.get("trail"):
    emojis.append("💫")

if config.get("links"):
    emojis.append("🔗")

if config.get("linksTriangles"):
    emojis.append("🔺")

if config.get("rotate"):
    emojis.append("🌀")

if config.get("wobble"):
    emojis.append("〰️")

if config.get("collisions") and config.get("collisionMode") == "bounce":
    emojis.append("⚡")

if config.get("collisionMode") == "destroy":
    emojis.append("💥")
```

#### 6. Interaction Modes (Priority: Medium)

```python
hover_emojis = {
    "grab": "🤏",
    "repulse": "💨",
    "bubble": "🫧",
    "connect": "🔗",
    "slow": "🐌",
    "attract": "🧲",
}

click_emojis = {
    "push": "👆",
    "remove": "🗑️",
    "absorb": "🌀",
}

if config.get("hoverMode") in hover_emojis:
    emojis.append(hover_emojis[config.get("hoverMode")])

if config.get("clickMode") in click_emojis:
    emojis.append(click_emojis[config.get("clickMode")])
```

#### 7. Movement & Direction (Priority: Low)

```python
if config.get("speed", 0) > 15:
    emojis.append("💨")

if config.get("attract"):
    emojis.append("🧲")

direction_emojis = {
    "top": "⬆️",
    "bottom": "⬇️",
    "left": "⬅️",
    "right": "➡️",
}

if config.get("direction") in direction_emojis:
    emojis.append(direction_emojis[config.get("direction")])
```

#### 8. Chaos Level (Priority: Medium)

```python
chaos = config.get("chaosLevel", 5)

if chaos >= 9:
    emojis.append("🌪️")  # Extreme chaos
elif chaos >= 7:
    emojis.append("💥")  # High chaos
elif chaos <= 2:
    emojis.append("😌")  # Calm
```

#### 9. Particle Count (Priority: Low)

```python
particle_count = config.get("particleCount", 0)

if particle_count > 200:
    emojis.append("✨")  # Many particles
elif particle_count < 30:
    emojis.append("🎯")  # Few particles
```

### Fallback Emojis

If fewer than 3 emojis are selected, fill remaining slots:

```python
creative_emojis = ["🎨", "🎭", "🎪", "🎯", "🎲", "🎰", "🌟", "💫", "🔮", "🎉"]

while len(emojis) < 3:
    emoji = random.choice(creative_emojis)
    if emoji not in emojis:
        emojis.append(emoji)

return "".join(emojis[:3])
```

### Complete Selection Algorithm

```python
def select_emojis_for_tsdice_config(config: dict) -> str:
    """
    Intelligent emoji selection based on tsDice particle configuration
    Returns 3 emojis representing the config
    """
    emojis = []

    # Priority 1: Special effects (most visible)
    if config.get("twinkle"):
        emojis.append("✨")

    if config.get("trail"):
        emojis.append("💫")

    if config.get("links"):
        emojis.append("🔗")

    if config.get("collisionMode") == "destroy":
        emojis.append("💥")

    if config.get("rotate"):
        emojis.append("🌀")

    # Priority 2: Theme and gravity
    if len(emojis) < 3:
        if config.get("theme") == "dark":
            emojis.append("🌙")
        elif config.get("theme") == "light":
            emojis.append("☀️")

    if len(emojis) < 3 and config.get("gravity"):
        emojis.append("🌍")

    # Priority 3: Color
    if len(emojis) < 3:
        color = config.get("color", "")
        if color == "random":
            emojis.append("🌈")
        # Add more color detection here

    # Priority 4: Shape
    if len(emojis) < 3:
        shape_map = {
            "star": "⭐",
            "circle": "⚪",
            "polygon": "🔷",
        }
        shape = config.get("shape")
        if shape in shape_map:
            emojis.append(shape_map[shape])

    # Priority 5: Chaos level
    if len(emojis) < 3:
        chaos = config.get("chaosLevel", 5)
        if chaos >= 9:
            emojis.append("🌪️")
        elif chaos <= 2:
            emojis.append("😌")

    # Fallback: Creative emojis
    creative = ["🎨", "🎭", "🎪", "🎯", "🎲", "🎰", "🌟", "💫", "🔮"]
    while len(emojis) < 3:
        emoji = random.choice(creative)
        if emoji not in emojis:
            emojis.append(emoji)

    # Remove duplicates and ensure exactly 3
    unique_emojis = []
    for e in emojis:
        if e not in unique_emojis:
            unique_emojis.append(e)

    return "".join(unique_emojis[:3])
```

---

## 🔧 Implementation Guide

### Step 1: Update `blueprints/tsdice_integration.py`

Replace the `select_emojis_for_config()` function (lines 32-87) with the enhanced version above.

### Step 2: Test with Sample Configs

```python
# Test cases
test_configs = [
    # Dark theme with gravity and twinkle
    {
        "theme": "dark",
        "gravity": True,
        "twinkle": True,
        "chaosLevel": 7
    },
    # Expected: 🌙🌍✨

    # Light theme with links and rotation
    {
        "theme": "light",
        "links": True,
        "rotate": True,
        "shape": "star"
    },
    # Expected: ☀️🔗🌀

    # High chaos with collisions
    {
        "chaosLevel": 10,
        "collisionMode": "destroy",
        "trail": True,
    },
    # Expected: 🌪️💥💫
]

for config in test_configs:
    result = select_emojis_for_tsdice_config(config)
    print(f"Config: {config}")
    print(f"Emojis: {result}\n")
```

### Step 3: Update Response Format (Optional)

Add emoji explanation to help debugging:

```python
# In tsdice_integration.py, line 179
return jsonify({
    "short_url": f"https://{short_domain}/{emojies}",
    "stats_url": f"https://{request.host}/stats/{emojies}",
    "emojis": emojies,
    "domain": short_domain,
    "original_url": url,
    "api_version": "2.0-tsdice",  # Updated version
    "authenticated": is_authenticated,
    "emoji_meanings": [  # NEW: Explain emoji choices
        {"emoji": emojies[0], "reason": "Dark theme"},
        {"emoji": emojies[1], "reason": "Gravity enabled"},
        {"emoji": emojies[2], "reason": "Twinkle effect"},
    ]
})
```

---

## ✅ Testing & Validation

### Manual Testing

```bash
# Test 1: Basic request
curl -X POST https://my.ket.horse/api/tsdice/share \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "url=https://ket.horse/?config=test" \
  -d 'config={"theme":"dark","gravity":true,"twinkle":true,"chaosLevel":7}'

# Expected: Emojis should be contextual (e.g., 🌙🌍✨)
```

### Automated Testing

```python
import requests
import json

def test_emoji_selection():
    test_cases = [
        {
            "name": "Dark + Gravity + Twinkle",
            "config": {
                "theme": "dark",
                "gravity": True,
                "twinkle": True,
                "chaosLevel": 7
            },
            "expected_emojis": ["🌙", "🌍", "✨"]
        },
        {
            "name": "Light + Links + Rotate",
            "config": {
                "theme": "light",
                "links": True,
                "rotate": True,
            },
            "expected_emojis": ["☀️", "🔗", "🌀"]
        },
    ]

    for test in test_cases:
        response = requests.post(
            "https://my.ket.horse/api/tsdice/share",
            data={
                "url": "https://ket.horse/?config=test",
                "config": json.dumps(test["config"])
            }
        )

        result = response.json()
        emojis = result["emojis"]

        print(f"Test: {test['name']}")
        print(f"Expected: {''.join(test['expected_emojis'])}")
        print(f"Got: {emojis}")
        print(f"Pass: {all(e in emojis for e in test['expected_emojis'])}\n")

test_emoji_selection()
```

### Validation Checklist

- [ ] API accepts all config properties without errors
- [ ] Response includes all required fields
- [ ] Emojis are contextually relevant (not random)
- [ ] Same config produces same emojis (deterministic)
- [ ] Emoji uniqueness is enforced (no duplicates)
- [ ] Fallback works when config is minimal
- [ ] Error messages are helpful and clear
- [ ] Rate limiting doesn't block legitimate tsDice traffic

---

## ⚠️ Error Handling

### Common Errors

#### 1. Invalid URL
```json
{
  "UrlError": "Invalid URL, URL must have a valid protocol and follow RFC patterns"
}
```
**Cause:** Malformed URL
**Fix:** Ensure URL includes protocol (https://)

#### 2. Missing Config
```json
{
  "error": "config parameter missing"
}
```
**Cause:** Config data not sent
**Fix:** Always include config parameter, even if empty `{}`

#### 3. Emoji Collision
```json
{
  "EmojiError": "Emoji already exists"
}
```
**Cause:** Generated emoji sequence already in database
**Fix:** Regenerate with fallback logic (API should handle automatically)

### Recommended Error Handling in API

```python
try:
    # Parse config
    if config_data:
        config = json.loads(config_data)
    else:
        config = {}

    # Select emojis
    emojis = select_emojis_for_tsdice_config(config)

    # Check collision
    attempts = 0
    while check_if_emoji_alias_exists(emojis) and attempts < 10:
        # Add randomness to avoid infinite collision
        emojis = select_emojis_for_tsdice_config(config)
        if attempts > 5:
            # Force random fallback
            emojis = generate_emoji_alias()
        attempts += 1

    if attempts >= 10:
        return jsonify({"error": "Could not generate unique emoji URL"}), 500

except json.JSONDecodeError:
    return jsonify({
        "error": "Invalid config JSON",
        "hint": "Ensure config is valid JSON string"
    }), 400
```

---

## 📊 Monitoring & Analytics

### Recommended Metrics

Track these for optimization:

1. **Emoji Distribution**
   - Which emojis are used most frequently?
   - Are certain configs over-represented?

2. **Selection Quality**
   - User feedback on emoji relevance
   - Click-through rates by emoji pattern

3. **Performance**
   - Average selection time
   - Collision rate (how often regeneration needed)

### Database Query Examples

```python
# Most popular emoji patterns
db.emoji_urls_collection.aggregate([
    {"$match": {"tsdice-config": True}},
    {"$group": {
        "_id": "$emojis",
        "count": {"$sum": 1},
        "total_clicks": {"$sum": "$total-clicks"}
    }},
    {"$sort": {"count": -1}},
    {"$limit": 20}
])

# Emoji effectiveness (clicks per share)
db.emoji_urls_collection.aggregate([
    {"$match": {"tsdice-config": True}},
    {"$group": {
        "_id": {"$substr": ["$emojis", 0, 1]},  # First emoji
        "avg_clicks": {"$avg": "$total-clicks"}
    }},
    {"$sort": {"avg_clicks": -1}}
])
```

---

## 🚀 Quick Implementation Checklist

For implementing in **spoo-horse** repository:

- [ ] Copy the `select_emojis_for_tsdice_config()` function
- [ ] Replace existing logic in `blueprints/tsdice_integration.py`
- [ ] Update API version to "2.0-tsdice"
- [ ] Add error handling for missing config properties
- [ ] Test with sample configs (provided above)
- [ ] Deploy to staging environment
- [ ] Verify emojis are contextual
- [ ] Deploy to production
- [ ] Monitor emoji distribution

---

## 📞 Support

**Issues:** Open an issue in the tsdice repository
**Questions:** Contact the tsDice team
**API Status:** https://my.ket.horse/api

---

**Last Updated:** 2025-11-30
**Maintained by:** tsDice Team
**API Version:** 2.0-tsdice
