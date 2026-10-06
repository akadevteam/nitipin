import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  leftIcon,
  style,
  inputStyle,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  autoCapitalize = 'sentences',
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const isPassword = secureTextEntry;

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          focused && styles.focused,
          error && styles.errorBorder,
          !editable && styles.disabled,
          multiline && styles.multiline,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={18}
            color={focused ? colors.primary : colors.neutral500}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={[styles.input, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.neutral300}
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.neutral500}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral700,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.neutral200,
    borderRadius: 12,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  focused: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  errorBorder: { borderColor: colors.danger },
  disabled: { backgroundColor: colors.neutral100 },
  multiline: { alignItems: 'flex-start', paddingVertical: 12 },
  leftIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.neutral900,
    padding: 0,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 4,
    marginLeft: 4,
  },
});
