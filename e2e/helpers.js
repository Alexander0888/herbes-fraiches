import { expect } from '@playwright/test';

export async function openEditor(page) {
  await page.getByRole('button', { name: 'Éditeur', exact: true }).click();
  await expect(page.locator('button.slot')).toHaveCount(48);
}

export async function chooseHerb(page, name) {
  const compact = page.getByRole('combobox', { name: 'Herbe à placer', exact: true });
  if (await compact.isVisible()) {
    await compact.click();
    await page.getByRole('option', { name, exact: true }).click();
  } else {
    await page.locator('.picker-buttons').getByRole('button', { name, exact: true }).click();
  }
}

export async function templateAction(page, name) {
  const menu = page.locator('.template-menu');
  if (await menu.isVisible()) {
    await menu.locator('summary').click();
    await menu.getByRole('button', { name, exact: true }).click();
  } else {
    await page.locator('.template-actions').getByRole('button', { name, exact: true }).click();
  }
}

export async function selectTemplate(page, name) {
  await page.getByRole('combobox', { name: 'Modèle à modifier', exact: true }).click();
  await page.getByRole('option', { name, exact: true }).click();
}

export async function confirm(page, action) {
  await page.getByRole('dialog').getByRole('button', { name: action, exact: true }).click();
}

export async function filled(page, count) {
  await expect(page.locator('.slot:not(.slot-empty)')).toHaveCount(count);
  await expect(page.locator('.slot-empty')).toHaveCount(48 - count);
}

export async function noOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}
