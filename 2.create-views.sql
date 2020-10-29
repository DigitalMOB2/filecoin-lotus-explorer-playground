CREATE VIEW chain_visualizer_chain_data_view AS
SELECT
    main_block.cid as block,
    bp.parent as parent,
    main_block.miner,
    main_block.height,
    main_block.parent_weight as parentweight,
    main_block.timestamp,
    main_block.parent_state_root as parentstateroot,
    parent_block.timestamp as parenttimestamp,
    parent_block.height as parentheight,
    mp.raw_bytes_power as parentpower,
    synced.synced_at as syncedtimestamp,
    (SELECT COUNT(*) FROM block_messages WHERE block_messages.block = main_block.cid) AS messages
  FROM
    block_headers main_block
  LEFT JOIN
    block_parents bp ON bp.block = main_block.cid
  LEFT JOIN
    block_headers parent_block ON parent_block.cid = bp.parent
  LEFT JOIN
    blocks_synced synced ON synced.cid = main_block.cid
  LEFT JOIN
    miner_power mp on main_block.parent_state_root = mp.state_root;

CREATE VIEW chain_visualizer_orphans_view AS
 SELECT
      block_headers.cid as block,
      block_headers.miner,
      block_headers.height,
      block_headers.parent_weight as parentweight,
      block_headers.timestamp,
      block_headers.parent_state_root as parentstateroot,
      block_parents.parent as parent
    FROM
      block_headers
    LEFT JOIN
      block_parents on block_headers.cid = block_parents.parent
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
      block_headers b on block_parents.block = b.cid;

CREATE VIEW chain_visualizer_blocks_view AS
    select * from block_headers;