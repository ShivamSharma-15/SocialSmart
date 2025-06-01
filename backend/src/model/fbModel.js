const pool = require("../config/db");

async function saveUser(userAccessToken, userName, userId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [check] = await conn.query(
      "SELECT id FROM facebook_users WHERE user_id = ?",
      [userId]
    );

    if (check.length !== 0) {
      await conn.query(
        "UPDATE facebook_users SET display_name = ?, access_token = ? WHERE user_id = ?",
        [userName, userAccessToken, userId]
      );
      await conn.commit();
      return check[0].id;
    } else {
      const [rows] = await conn.query(
        "INSERT INTO facebook_users (display_name, access_token, user_id) VALUES (?, ?, ?)",
        [userName, userAccessToken, userId]
      );
      await conn.commit();
      return rows.insertId;
    }
  } catch (err) {
    await conn.rollback();
    console.error("Transaction failed:", err);
    return null;
  } finally {
    conn.release();
  }
}

async function savePage(pages, userId) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    for (const page of pages) {
      const [rows] = await conn.query(
        "SELECT user_id FROM facebook_pages WHERE page_id = ?",
        [page.id]
      );

      if (rows.length === 0) {
        // Page doesn't exist → insert it
        await conn.query(
          "INSERT INTO facebook_pages (user_id, page_id, page_name, page_access_token) VALUES (?, ?, ?, ?)",
          [userId, page.id, page.name || null, page.access_token]
        );
      } else if (rows[0].user_id === userId) {
        await conn.query(
          "UPDATE facebook_pages SET page_name = ?, page_access_token = ? WHERE page_id = ? AND user_id = ?",
          [page.name || null, page.access_token, page.id, userId]
        );
      }
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    console.error("Error saving pages:", err);
    throw err;
  } finally {
    conn.release();
  }
}

async function subscribe(successfulSubs) {
  if (!successfulSubs || successfulSubs.length === 0) return;

  const updateQuery = `
    UPDATE facebook_pages
    SET subscribed = 1
    WHERE page_id = ?
  `;

  const promises = successfulSubs.map((entry) => {
    const pageId = entry.pageId || entry.id;
    if (!pageId) return null;
    return pool.query(updateQuery, [pageId]);
  });

  await Promise.all(promises);
}
async function getPageAccessToken(page_id) {
  const page_id_str = String(page_id).trim();
  try {
    const [rows] = await pool.query(
      "SELECT id, page_access_token FROM facebook_pages WHERE page_id = ?",
      [page_id_str]
    );
    if (rows.length !== 1) return null;
    else return rows[0];
  } catch (err) {
    console.log("Could not find", err);
  }
}
module.exports = {
  saveUser,
  savePage,
  subscribe,
  getPageAccessToken,
};
