/*
  A nonogram game written in javascript
  https://github.com/DomenicoDeFelice/Pi-Nonograms

  Play the game: https://domdefelice.net/pi-nonograms/

  Copyright (c) 2013-2025 Domenico De Felice

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
    const FIXED_SEED = '314159';
    const WIDTH = '8';
    const HEIGHT = '8';

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.fill('#width', WIDTH);
        await page.fill('#height', HEIGHT);
        await page.fill('#nonogram_id', FIXED_SEED);
    });

    test('classic theme - initial state', async ({ page }) => {
        await page.selectOption('#theme', 'classic');
        await page.click('#play_by_id');

        // Move mouse away to avoid hover effects
        await page.mouse.move(0, 0);

        await expect(page.locator('table.nonogram.classic')).toHaveScreenshot(
            'classic-initial.png'
        );
    });

    test('classic theme - with guesses', async ({ page }) => {
        await page.selectOption('#theme', 'classic');
        await page.click('#play_by_id');

        // Make some guesses
        await page.locator('td.nonogram_cell').nth(0).click(); // Filled
        await page.locator('td.nonogram_cell').nth(1).click(); // Filled
        await page.locator('td.nonogram_cell').nth(1).click(); // Empty
        await page.locator('td.nonogram_cell').nth(5).click(); // Filled

        // Move mouse away to avoid hover effects
        await page.mouse.move(0, 0);

        await expect(page.locator('table.nonogram.classic')).toHaveScreenshot(
            'classic-with-guesses.png'
        );
    });

    test('paper theme - initial state', async ({ page }) => {
        await page.selectOption('#theme', 'paper');
        await page.click('#play_by_id');

        // Move mouse away to avoid hover effects
        await page.mouse.move(0, 0);

        await expect(page.locator('table.nonogram.paper')).toHaveScreenshot('paper-initial.png');
    });

    test('paper theme - with guesses', async ({ page }) => {
        await page.selectOption('#theme', 'paper');
        await page.click('#play_by_id');

        // Make some guesses
        await page.locator('td.nonogram_cell').nth(0).click();
        await page.locator('td.nonogram_cell').nth(2).click();
        await page.locator('td.nonogram_cell').nth(2).click();
        await page.locator('td.nonogram_cell').nth(7).click();

        // Move mouse away to avoid hover effects
        await page.mouse.move(0, 0);

        await expect(page.locator('table.nonogram.paper')).toHaveScreenshot(
            'paper-with-guesses.png'
        );
    });

    test('koala theme - initial state', async ({ page }) => {
        await page.selectOption('#theme', 'koala');
        await page.click('#play_by_id');

        // Move mouse away to avoid hover effects
        await page.mouse.move(0, 0);

        await expect(page.locator('table.nonogram.koala')).toHaveScreenshot('koala-initial.png');
    });

    test('koala theme - with guesses', async ({ page }) => {
        await page.selectOption('#theme', 'koala');
        await page.click('#play_by_id');

        await page.locator('td.nonogram_cell').nth(3).click();
        await page.locator('td.nonogram_cell').nth(4).click();
        await page.locator('td.nonogram_cell').nth(4).click();

        // Move mouse away to avoid hover effects
        await page.mouse.move(0, 0);

        await expect(page.locator('table.nonogram.koala')).toHaveScreenshot(
            'koala-with-guesses.png'
        );
    });

    test('small theme - initial state', async ({ page }) => {
        await page.selectOption('#theme', 'small');
        await page.click('#play_by_id');

        // Move mouse away to avoid hover effects
        await page.mouse.move(0, 0);

        await expect(page.locator('table.nonogram.small')).toHaveScreenshot('small-initial.png');
    });

    test('small theme - with guesses', async ({ page }) => {
        await page.selectOption('#theme', 'small');
        await page.click('#play_by_id');

        await page.locator('td.nonogram_cell').nth(1).click();
        await page.locator('td.nonogram_cell').nth(6).click();
        await page.locator('td.nonogram_cell').nth(6).click();

        // Move mouse away to avoid hover effects
        await page.mouse.move(0, 0);

        await expect(page.locator('table.nonogram.small')).toHaveScreenshot(
            'small-with-guesses.png'
        );
    });

    test('hover state - classic theme', async ({ page }) => {
        await page.selectOption('#theme', 'classic');
        await page.click('#play_by_id');

        const cell = page.locator('td.nonogram_cell').nth(10);
        await cell.hover();

        await expect(page.locator('table.nonogram.classic')).toHaveScreenshot('classic-hover.png');
    });

    test('solved state - classic theme', async ({ page }) => {
        // Use a very small puzzle for easier solving
        await page.fill('#width', '3');
        await page.fill('#height', '3');
        await page.fill('#nonogram_id', '12345');
        await page.selectOption('#theme', 'classic');
        await page.click('#play_by_id');

        // Click hints until puzzle is solved (dialog appears)
        // The dialog will block further clicks, so we check for it
        for (let i = 0; i < 9; i++) {
            // Check if dialog appeared (puzzle solved)
            const dialogVisible = await page.locator('#victory-dialog[open]').count();
            if (dialogVisible > 0) {
                break;
            }
            await page.click('#give_hint');
            await page.waitForTimeout(100);
        }

        // Wait for victory dialog to appear
        await page.waitForSelector('#victory-dialog[open]', { timeout: 2000 });

        // Close the victory dialog
        await page.click('.victory-close');

        // Wait for dialog to close
        await page.waitForTimeout(100);

        // Move mouse away to avoid hover effects
        await page.mouse.move(0, 0);

        await expect(page.locator('table.nonogram.classic')).toHaveScreenshot(
            'classic-fully-hinted.png'
        );
    });

    test('all themes side-by-side comparison', async ({ page }) => {
        const themes = ['classic', 'paper', 'koala', 'small'];

        for (const theme of themes) {
            await page.goto('/');
            await page.fill('#width', '5');
            await page.fill('#height', '5');
            await page.fill('#nonogram_id', '99999');
            await page.selectOption('#theme', theme);
            await page.click('#play_by_id');

            // Make identical guesses for all themes
            await page.locator('td.nonogram_cell').nth(0).click();
            await page.locator('td.nonogram_cell').nth(6).click();
            await page.locator('td.nonogram_cell').nth(6).click();
            await page.locator('td.nonogram_cell').nth(12).click();

            // Move mouse away from the nonogram to avoid hover effects
            await page.mouse.move(0, 0);

            await expect(page.locator(`table.nonogram.${theme}`)).toHaveScreenshot(
                `${theme}-comparison.png`
            );
        }
    });
});
