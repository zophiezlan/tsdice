"""
COPY THIS FILE TO: spoo-horse/blueprints/tsdice_integration.py

Replace the select_emojis_for_config() function (lines 32-87) with this enhanced version.
This provides intelligent emoji selection based on comprehensive tsDice config data.

Version: 2.0
Last Updated: 2025-11-30
"""

import random


def select_emojis_for_config(config_data):
    """
    Enhanced emoji selection for tsDice particle configurations

    Analyzes comprehensive config data and selects 3 contextually relevant emojis.
    Selection priority: Special Effects > Theme/Physics > Colors > Shapes > Chaos

    Args:
        config_data: JSON object or string containing tsDice particle config

    Returns:
        str: 3 emojis representing the configuration

    Example:
        >>> config = {"theme": "dark", "gravity": True, "twinkle": True}
        >>> select_emojis_for_config(config)
        '🌙🌍✨'
    """

    # Parse config if string
    if isinstance(config_data, str):
        try:
            import json
            config = json.loads(config_data)
        except:
            config = {}
    else:
        config = config_data or {}

    emojis = []

    # ========================================
    # PRIORITY 1: Special Effects (High Impact)
    # ========================================

    if config.get("twinkle") and "✨" not in emojis:
        emojis.append("✨")

    if config.get("trail") and "💫" not in emojis:
        emojis.append("💫")

    if config.get("links") and "🔗" not in emojis:
        emojis.append("🔗")

    if config.get("collisionMode") == "destroy" and "💥" not in emojis:
        emojis.append("💥")

    if config.get("rotate") and "🌀" not in emojis:
        emojis.append("🌀")

    if config.get("wobble") and "〰️" not in emojis:
        emojis.append("〰️")

    if config.get("linksTriangles") and "🔺" not in emojis:
        emojis.append("🔺")

    # ========================================
    # PRIORITY 2: Theme & Physics
    # ========================================

    if len(emojis) < 3:
        if config.get("theme") == "dark" and "🌙" not in emojis:
            emojis.append("🌙")
        elif config.get("theme") == "light" and "☀️" not in emojis:
            emojis.append("☀️")

    if len(emojis) < 3 and config.get("gravity") and "🌍" not in emojis:
        emojis.append("🌍")

    if len(emojis) < 3 and config.get("walls") and "🧱" not in emojis:
        emojis.append("🧱")

    # ========================================
    # PRIORITY 3: Colors
    # ========================================

    if len(emojis) < 3:
        color = str(config.get("color", "")).lower()

        if color == "random" and "🌈" not in emojis:
            emojis.append("🌈")
        elif ("#ff" in color or "red" in color) and "❤️" not in emojis:
            emojis.append("❤️")
        elif ("#00" in color or "blue" in color) and "💙" not in emojis:
            emojis.append("💙")
        elif "green" in color and "💚" not in emojis:
            emojis.append("💚")
        elif ("purple" in color or "violet" in color) and "💜" not in emojis:
            emojis.append("💜")
        elif ("yellow" in color or "gold" in color) and "💛" not in emojis:
            emojis.append("💛")

    # ========================================
    # PRIORITY 4: Shapes
    # ========================================

    if len(emojis) < 3:
        shape = config.get("shape", "")

        shape_map = {
            "star": "⭐",
            "circle": "⚪",
            "square": "🟦",
            "triangle": "🔺",
            "polygon": "🔷",
        }

        if shape in shape_map and shape_map[shape] not in emojis:
            emojis.append(shape_map[shape])

        # Character particles use their own emoji
        if config.get("isCharacter") and config.get("characterValue"):
            char_emoji = config.get("characterValue")
            if char_emoji not in emojis:
                emojis.append(char_emoji)

    # ========================================
    # PRIORITY 5: Interaction Modes
    # ========================================

    if len(emojis) < 3:
        hover_mode = config.get("hoverMode", "")
        click_mode = config.get("clickMode", "")

        hover_emoji_map = {
            "grab": "🤏",
            "repulse": "💨",
            "bubble": "🫧",
            "connect": "🔗",
            "slow": "🐌",
            "attract": "🧲",
        }

        click_emoji_map = {
            "push": "👆",
            "remove": "🗑️",
            "absorb": "🌀",
        }

        if hover_mode in hover_emoji_map and hover_emoji_map[hover_mode] not in emojis:
            emojis.append(hover_emoji_map[hover_mode])

        if len(emojis) < 3 and click_mode in click_emoji_map and click_emoji_map[click_mode] not in emojis:
            emojis.append(click_emoji_map[click_mode])

    # ========================================
    # PRIORITY 6: Chaos Level
    # ========================================

    if len(emojis) < 3:
        chaos = config.get("chaosLevel", 5)

        if chaos >= 9 and "🌪️" not in emojis:
            emojis.append("🌪️")
        elif chaos >= 7 and "💥" not in emojis:
            emojis.append("💥")
        elif chaos <= 2 and "😌" not in emojis:
            emojis.append("😌")

    # ========================================
    # PRIORITY 7: Movement & Speed
    # ========================================

    if len(emojis) < 3:
        speed = config.get("speed", 0)
        direction = config.get("direction", "")

        if speed > 15 and "💨" not in emojis:
            emojis.append("💨")

        if config.get("attract") and "🧲" not in emojis:
            emojis.append("🧲")

        direction_emoji_map = {
            "top": "⬆️",
            "bottom": "⬇️",
            "left": "⬅️",
            "right": "➡️",
            "top-right": "↗️",
            "top-left": "↖️",
            "bottom-right": "↘️",
            "bottom-left": "↙️",
        }

        if len(emojis) < 3 and direction in direction_emoji_map:
            dir_emoji = direction_emoji_map[direction]
            if dir_emoji not in emojis:
                emojis.append(dir_emoji)

    # ========================================
    # PRIORITY 8: Particle Count
    # ========================================

    if len(emojis) < 3:
        particle_count = config.get("particleCount", 0)

        if particle_count > 200 and "✨" not in emojis:
            emojis.append("✨")
        elif particle_count < 30 and "🎯" not in emojis:
            emojis.append("🎯")

    # ========================================
    # FALLBACK: Creative Emojis
    # ========================================

    creative_emojis = [
        "🎨", "🎭", "🎪", "🎯", "🎲", "🎰",
        "🌟", "💫", "🔮", "🎉", "🎈", "🎆"
    ]

    # Fill remaining slots
    while len(emojis) < 3:
        emoji = random.choice(creative_emojis)
        if emoji not in emojis:
            emojis.append(emoji)

    # Ensure exactly 3 unique emojis
    unique_emojis = []
    for e in emojis:
        if e not in unique_emojis:
            unique_emojis.append(e)

    return "".join(unique_emojis[:3])


# ========================================
# TEST CASES
# ========================================

def test_emoji_selection():
    """
    Run this function to test the emoji selection logic
    """

    test_cases = [
        {
            "name": "Dark theme with gravity and twinkle",
            "config": {
                "theme": "dark",
                "gravity": True,
                "twinkle": True,
                "chaosLevel": 7
            },
            "expected_contains": ["🌙", "🌍", "✨"]
        },
        {
            "name": "Light theme with links and rotation",
            "config": {
                "theme": "light",
                "links": True,
                "rotate": True,
                "shape": "star"
            },
            "expected_contains": ["☀️", "🔗", "🌀"]
        },
        {
            "name": "High chaos with collisions",
            "config": {
                "chaosLevel": 10,
                "collisionMode": "destroy",
                "trail": True,
            },
            "expected_contains": ["💥", "💫", "🌪️"]
        },
        {
            "name": "Rainbow colors with wobble",
            "config": {
                "color": "random",
                "wobble": True,
                "shape": "circle",
            },
            "expected_contains": ["🌈", "〰️", "⚪"]
        },
        {
            "name": "Character particles",
            "config": {
                "isCharacter": True,
                "characterValue": "🔥",
                "speed": 20,
                "theme": "dark"
            },
            "expected_contains": ["🔥", "💨", "🌙"]
        },
        {
            "name": "Calm minimal config",
            "config": {
                "chaosLevel": 1,
                "particleCount": 20,
                "theme": "light"
            },
            "expected_contains": ["😌", "🎯", "☀️"]
        },
    ]

    print("=" * 60)
    print("EMOJI SELECTION TEST SUITE")
    print("=" * 60)

    passed = 0
    failed = 0

    for test in test_cases:
        result = select_emojis_for_config(test["config"])
        expected = test["expected_contains"]

        # Check if all expected emojis are present
        all_present = all(emoji in result for emoji in expected)

        status = "✅ PASS" if all_present else "❌ FAIL"

        if all_present:
            passed += 1
        else:
            failed += 1

        print(f"\n{status} | {test['name']}")
        print(f"  Config: {test['config']}")
        print(f"  Expected: {''.join(expected)}")
        print(f"  Got: {result}")

    print("\n" + "=" * 60)
    print(f"RESULTS: {passed} passed, {failed} failed")
    print("=" * 60)


# ========================================
# USAGE EXAMPLE
# ========================================

if __name__ == "__main__":
    # Run tests
    test_emoji_selection()

    # Example usage
    print("\n" + "=" * 60)
    print("USAGE EXAMPLE")
    print("=" * 60)

    sample_config = {
        "theme": "dark",
        "gravity": True,
        "twinkle": True,
        "chaosLevel": 8,
        "shape": "star",
        "color": "random"
    }

    emojis = select_emojis_for_config(sample_config)
    print(f"\nConfig: {sample_config}")
    print(f"Selected Emojis: {emojis}")
    print(f"Emoji count: {len(emojis)}")
    print(f"All unique: {len(emojis) == len(set(emojis))}")
