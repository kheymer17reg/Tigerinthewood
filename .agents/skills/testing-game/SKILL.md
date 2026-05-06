# Testing TigerinTheWood Game

## Overview
TigerinTheWood is a static-site educational programming game deployed on Netlify. It uses localStorage for all state (login, progress, achievements). No backend auth is required.

## Environment Setup
- **Production**: https://tigerinthewood.netlify.app
- **PR Previews**: https://deploy-preview-{N}--tigerinthewood.netlify.app
- **Auth**: Enter any username + password in the login form. No server-side validation — credentials are stored in localStorage.
- **No secrets needed** for testing.

## Login Flow
1. Open the app URL
2. Enter any username in the login field
3. Enter any password
4. Click "Войти в игру"
5. A tiger naming modal appears — accept the default name or enter a custom one
6. Click "Начать приключение!"
7. An intro story dialog may appear — click "Пропустить" to skip

## Testing Levels

### Level Structure
- Each level has: start position, exit position, objects (trees, meat, keys, doors), and a task description
- The game uses an 8x8 grid
- Commands are in Russian: `вправо()`, `влево()`, `вверх()`, `вниз()`, `есть()`, `взять()`, `открыть()`
- Commands accept a repeat count: `вправо(3)` moves right 3 times

### Playing a Level
1. Type commands in the code editor textarea
2. Click "ЗАПУСТИТЬ" (Run) to execute
3. Tiger animates through the commands (wait ~5-10s for animation)
4. If tiger reaches exit with required conditions met, victory modal appears
5. Click "Следующий уровень" to advance

### Level 1 Quick Solution (Regression Test)
```
вправо(3)
есть()
вправо(3)
```
Expected: Score ~148, 6 steps, 1/1 meat

### Unlocking Levels via Console
To skip ahead and test specific levels without playing through all previous ones:
```javascript
localStorage.setItem('completedLevels', JSON.stringify([1,2,3,4,5,6]));
location.reload();
```
Adjust the array to include whichever levels you want marked as completed.

### Level 7 Solution (New Level Test)
```
вверх(2)
вправо(1)
есть()
вправо(3)
есть()
вниз(3)
вправо(2)
есть()
вверх(1)
вправо(1)
```
Expected: Score ~154, 13 steps, 3/3 meat

## Key Assertions to Verify

### Level Button Rendering
- Check that the correct number of level buttons are displayed
- Each button should have a unique emoji icon extracted from the level name
- Only Level 1 and completed+1 levels should be clickable
- Locked levels show tooltip "Пройди уровень X, чтобы разблокировать"

### Progressive Unlock
- Completing a level should unlock the next one
- The completed level button gets a dot/checkmark indicator
- The "Следующий уровень" button in victory modal should advance to next level

### Stats Modal
- Click "Статистика" in the nav bar
- Should show "X/N Пройдено" where N = total number of levels (dynamically calculated)
- All levels should be listed in "По уровням" section
- Completed levels show step count, time, and star rating

### Story System
- Each new level should trigger a story dialog when first loaded
- Stories have narrator and tiger character dialogs
- Can be skipped with "Пропустить" button

## Common Issues
- If level buttons don't match total levels, check for hardcoded level counts in `game-engine.js`
- If stats show wrong total (e.g., "/6" instead of "/15"), check `stats-achievements.js` for hardcoded values
- The game animation takes time — wait for "ИДЁТ..." button to finish before checking results
- Story dialogs may block interaction — skip or click through them before testing gameplay
- Level buttons might use `flex-wrap` for many levels — verify they wrap properly on different screen sizes

## Architecture Notes
- All game logic is client-side JavaScript (no build step)
- Key files: `levels.js` (level definitions), `game-engine.js` (core logic), `story-system.js` (narratives), `stats-achievements.js` (stats/achievements)
- Level count is derived dynamically via `Object.keys(levels).length`
- CSS is inline in `index.html`
- Netlify deploys automatically on push to main or PR creation
