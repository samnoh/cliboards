import Page from './page';
import constants from '../constants';

const { CLIEN_URL } = constants;

export const start = async () => {
    const page = await Page.build();
    await page.goto(CLIEN_URL);

    const rows = await page.getAllContentsOf('.symph_row');
    console.log(rows);
    await page.close();
};
