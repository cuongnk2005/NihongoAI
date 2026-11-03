package com.nihongoai.backend.repository;

import com.nihongoai.backend.entity.SystemSettingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemSettingRepository extends JpaRepository<SystemSettingEntity, String> {
}
