CREATE VIEW chain_visualizer_chain_data_view AS
SELECT
    main_block.cid as block,
    bp.parent as parent,
    main_block.miner,
    main_block.height,
    main_block.parentweight,
    main_block.timestamp,
    main_block.parentstateroot,
    parent_block.timestamp as parenttimestamp,
    parent_block.height as parentheight,
    100 as parentpower,
    synced.synced_at as syncedtimestamp,
    (SELECT COUNT(*) FROM block_messages WHERE block_messages.block = main_block.cid) AS messages
  FROM
    blocks main_block
  LEFT JOIN
    block_parents bp ON bp.block = main_block.cid
  LEFT JOIN
    blocks parent_block ON parent_block.cid = bp.parent
  LEFT JOIN
    blocks_synced synced ON synced.cid = main_block.cid
  LEFT JOIN
    miner_sectors_heads heads ON heads.state_root = main_block.parentstateroot and heads.miner_id = parent_block.miner;

CREATE VIEW chain_visualizer_orphans_view AS
 SELECT
      blocks.cid as block,
      blocks.miner,
      blocks.height,
      blocks.parentweight,
      blocks.timestamp,
      blocks.parentstateroot,
      block_parents.parent as parent
    FROM
      blocks
    LEFT JOIN
      block_parents on blocks.cid = block_parents.parent
    WHERE
      block_parents.block IS NULL;

CREATE VIEW chain_visualizer_blocks_with_parents_view AS
    SELECT
      block,
      parent,
      b.miner,
      b.height,
      b.timestamp

    FROM
      block_parents
    INNER JOIN
      blocks b on block_parents.block = b.cid;

CREATE VIEW chain_visualizer_blocks_view AS
    select * from blocks;
